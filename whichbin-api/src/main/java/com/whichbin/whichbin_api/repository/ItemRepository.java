package com.whichbin.whichbin_api.repository;

import com.whichbin.whichbin_api.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    boolean existsByNameIgnoreCase(String name);

    @Query("""
            SELECT i FROM Item i
            WHERE (:searchText = '' OR LOCATE(:searchText, LOWER(i.name)) > 0
                OR EXISTS (SELECT k FROM Item other JOIN other.keywords k
                    WHERE other = i AND LOCATE(:searchText, LOWER(k)) > 0))
            AND (:recyclable IS NULL OR i.recyclable = :recyclable)
            ORDER BY CASE LOWER(i.name)
                WHEN 'plastic water bottle' THEN 1
                WHEN 'plastic bottle' THEN 2
                WHEN 'plastic bag' THEN 3
                WHEN 'box (cardboard)' THEN 4
                WHEN 'cardboard box' THEN 4
                WHEN 'aluminum can' THEN 5
                WHEN 'beer can' THEN 5
                WHEN 'metal beverage can' THEN 6
                WHEN 'food scraps' THEN 7
                WHEN 'glass bottle' THEN 8
                WHEN 'paper towels' THEN 9
                WHEN 'paper towel' THEN 9
                WHEN 'paper' THEN 10
                WHEN 'plastic wrap' THEN 11
                WHEN 'newspaper' THEN 12
                WHEN 'pizza box' THEN 13
                WHEN 'plastic milk jug' THEN 14
                WHEN 'styrofoam' THEN 15
                WHEN 'glass jar' THEN 16
                WHEN 'cup (styrofoam)' THEN 17
                WHEN 'foam cup' THEN 17
                WHEN 'metal food can (no food residue)' THEN 18
                WHEN 'steel food can' THEN 18
                WHEN 'battery (disposable)' THEN 19
                WHEN 'plastic soda bottle' THEN 20
                WHEN 'diaper' THEN 21
                WHEN 'disposable diaper' THEN 21
                WHEN 'plastic detergent bottle' THEN 22
                WHEN 'broken glass' THEN 23
                WHEN 'paper bags' THEN 24
                WHEN 'plastic straw' THEN 25
                ELSE 1000 END
            """)
    Page<Item> searchItems(@Param("searchText") String searchText,
                           @Param("recyclable") Boolean recyclable,
                           Pageable pageable);

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
                :recyclable IS NULL
                OR i.recyclable = :recyclable
            )
            ORDER BY i.name ASC
            """)
    List<Item> searchItems(
            @Param("searchText") String searchText,
            @Param("recyclable") Boolean recyclable
    );
}
