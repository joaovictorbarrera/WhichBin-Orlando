package com.whichbin.whichbin_api.repository;

import com.whichbin.whichbin_api.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
}