
package com.whichbin.whichbin_api.migrations;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Locale;

@Component
public class AnnouncementMessageSchemaMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public AnnouncementMessageSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        ColumnInfo column = jdbcTemplate.execute(
                (ConnectionCallback<ColumnInfo>) connection -> {
                    DatabaseMetaData metadata = connection.getMetaData();

                    try (ResultSet columns = metadata.getColumns(
                            connection.getCatalog(),
                            null,
                            "announcements",
                            "message"
                    )) {
                        if (!columns.next()) {
                            throw new SQLException(
                                    "The announcements.message column does not exist"
                            );
                        }

                        return new ColumnInfo(
                                columns.getInt("DATA_TYPE"),
                                columns.getString("TYPE_NAME"),
                                columns.getInt("COLUMN_SIZE"),
                                columns.getInt("NULLABLE")
                        );
                    }
                }
        );

        if (column == null) {
            throw new IllegalStateException(
                    "Could not inspect announcements.message"
            );
        }

        String typeName = column.typeName().toUpperCase(Locale.ROOT);

        // The column already has the expected type.
        if (typeName.equals("TEXT")) {
            return;
        }

        // Only automatically migrate the original VARCHAR column.
        if (column.sqlType() != Types.VARCHAR) {
            throw new IllegalStateException(
                    "Unexpected announcements.message type: " + column.typeName()
            );
        }

        // TEXT supports more data than the original VARCHAR(255).
        // Refuse unexpected larger columns rather than risk truncation.
        if (column.size() != 255) {
            throw new IllegalStateException(
                    "Review required: announcements.message is VARCHAR("
                            + column.size() + ")"
            );
        }

        String nullability;

        if (column.nullable() == DatabaseMetaData.columnNullable) {
            nullability = "NULL";
        } else if (column.nullable() == DatabaseMetaData.columnNoNulls) {
            nullability = "NOT NULL";
        } else {
            throw new IllegalStateException(
                    "Could not determine announcements.message nullability"
            );
        }

        jdbcTemplate.execute(
        "ALTER TABLE announcements MODIFY COLUMN message TEXT "
                + nullability
        );
    }

    private record ColumnInfo(
            int sqlType,
            String typeName,
            int size,
            int nullable
    ) {
    }
}


