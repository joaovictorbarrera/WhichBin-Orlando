package com.whichbin.whichbin_api.repository;

import com.whichbin.whichbin_api.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query("""
            SELECT DISTINCT i
            FROM Item i
            LEFT JOIN i.keywords keyword
            WHERE (
                :searchText = ''
                OR LOCATE(:searchText, LOWER(i.name)) > 0
                OR LOCATE(:searchText, LOWER(keyword)) > 0
            )
            AND (
                :recycleable IS NULL
                OR i.recycleable = :recycleable
            )
            ORDER BY i.name ASC
            """)
    List<Item> searchItems(
            @Param("searchText") String searchText,
            @Param("recycleable") Boolean recycleable
    );
}