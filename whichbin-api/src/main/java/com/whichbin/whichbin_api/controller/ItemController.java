package com.whichbin.whichbin_api.controller;

import com.whichbin.whichbin_api.auth.Authenticated;
import com.whichbin.whichbin_api.dto.PaginatedResponse;
import com.whichbin.whichbin_api.model.Item;
import com.whichbin.whichbin_api.service.ItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public PaginatedResponse<Item> getItems(
            @RequestParam(
                    name = "searchText",
                    defaultValue = ""
            ) String searchText,
            @RequestParam(
                    name = "recyclable",
                    defaultValue = "",
                    required = false
            ) Boolean recyclable,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "pageSize", defaultValue = "10") int pageSize
    ) {
        if (page < 1 || pageSize < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page and pageSize must be greater than zero"
            );
        }

        Page<Item> itemPage = itemService.searchItems(
                searchText,
                recyclable,
                page - 1,
                pageSize
        );

        return new PaginatedResponse<>(
                itemPage.getNumber() + 1,
                itemPage.getTotalPages(),
                itemPage.getSize(),
                itemPage.getTotalElements(),
                itemPage.getContent()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(
            @PathVariable("id") Long id
    ) {
        return itemService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Authenticated
    @PostMapping
    public ResponseEntity<Item> createItem(@RequestBody Item item) {
        Item created = itemService.createItem(item);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    @Authenticated
    @PutMapping("/{id}")
    public Item updateItem(
            @PathVariable("id") Long id,
            @RequestBody Item item
    ) {
        return itemService.updateItem(id, item);
    }

    @Authenticated
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable("id") Long id
    ) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
