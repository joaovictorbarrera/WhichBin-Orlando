package com.whichbin.whichbin_api.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class UserPasswordSchemaMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public UserPasswordSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        Boolean passwordColumnIsNullable = jdbcTemplate.execute((ConnectionCallback<Boolean>) connection -> {
            try (ResultSet columns = connection.getMetaData().getColumns(
                    connection.getCatalog(),
                    null,
                    "users",
                    "password_hash"
            )) {
                if (!columns.next()) {
                    throw new SQLException("The users.password_hash column does not exist");
                }

                return "YES".equalsIgnoreCase(columns.getString("IS_NULLABLE"));
            }
        });

        if (!Boolean.TRUE.equals(passwordColumnIsNullable)) {
            jdbcTemplate.execute(
                    "ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL"
            );
        }
    }
}
