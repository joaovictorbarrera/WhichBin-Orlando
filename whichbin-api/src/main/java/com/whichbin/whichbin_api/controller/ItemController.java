package com.whichbin.whichbin_api.controller;

import com.whichbin.whichbin_api.auth.Authenticated;
import com.whichbin.whichbin_api.model.Item;
import com.whichbin.whichbin_api.service.ItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/items")
public class ItemController {

    public record ItemPage(List<Item> content, int number, int size,
                           long totalElements, int totalPages) {
        static ItemPage from(Page<Item> page) {
            return new ItemPage(page.getContent(), page.getNumber(), page.getSize(),
                    page.getTotalElements(), page.getTotalPages());
        }
    }

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public ItemPage getItems(
            @RequestParam(
                    name = "searchText",
                    defaultValue = ""
            ) String searchText,
            @RequestParam(
                    name = "recyclable",
                    defaultValue = "",
                    required = false
            ) Boolean recyclable,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        return ItemPage.from(itemService.searchItems(searchText, recyclable, page, size));
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
