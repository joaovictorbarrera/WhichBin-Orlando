package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.model.Item;
import com.whichbin.whichbin_api.repository.ItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Transactional(readOnly = true)
    public List<Item> getAllItems() {
        return searchItems(null, null);
    }

    @Transactional(readOnly = true)
    public List<Item> searchItems(String searchText, Boolean recycleable) {
        String text = searchText == null ? "" : searchText.trim();

        if (text.length() > 150) {
            throw badRequest("Search text cannot exceed 150 characters.");
        }

        return itemRepository.searchItems(
                text.toLowerCase(Locale.ROOT),
                recycleable
        );
    }

    @Transactional(readOnly = true)
    public Optional<Item> getItemById(Long id) {
        validateId(id);
        return itemRepository.findById(id);
    }

    public Item createItem(Item input) {
        validateAndNormalize(input);

        Item item = new Item();
        copyEditableFields(input, item);

        return itemRepository.saveAndFlush(item);
    }

    public Item updateItem(Long id, Item input) {
        Item existing = requireItem(id);
        validateAndNormalize(input);
        copyEditableFields(input, existing);

        return itemRepository.saveAndFlush(existing);
    }

    public void deleteItem(Long id) {
        Item existing = requireItem(id);
        itemRepository.delete(existing);
    }

    private Item requireItem(Long id) {
        return getItemById(id).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Item not found."
                )
        );
    }

    private void copyEditableFields(Item source, Item target) {
        target.setName(source.getName());
        target.setRecycleable(source.getRecycleable());
        target.setInformation(source.getInformation());

        target.getKeywords().clear();
        target.getKeywords().addAll(source.getKeywords());
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw badRequest("Item ID must be a positive number.");
        }
    }

    private void validateAndNormalize(Item item) {
        if (item == null) {
            throw badRequest("An item request body is required.");
        }

        if (item.getName() == null || item.getName().isBlank()) {
            throw badRequest("Item name is required.");
        }

        String name = item.getName().trim();

        if (name.length() > 150) {
            throw badRequest("Item name cannot exceed 150 characters.");
        }

        if (item.getRecycleable() == null) {
            throw badRequest(
                    "Recycleable must be provided as true or false."
            );
        }

        if (item.getInformation() == null
                || item.getInformation().isBlank()) {
            throw badRequest("Disposal information is required.");
        }

        String information = item.getInformation().trim();

        if (information.length() > 5000) {
            throw badRequest(
                    "Disposal information cannot exceed 5000 characters."
            );
        }

        Set<String> normalizedKeywords = new LinkedHashSet<>();

        if (item.getKeywords() != null) {
            if (item.getKeywords().size() > 20) {
                throw badRequest(
                        "An item cannot have more than 20 keywords."
                );
            }

            for (String keyword : item.getKeywords()) {
                if (keyword == null || keyword.isBlank()) {
                    throw badRequest("Keywords cannot be null or blank.");
                }

                String normalized = keyword.trim()
                        .toLowerCase(Locale.ROOT);

                if (normalized.length() > 100) {
                    throw badRequest(
                            "Each keyword cannot exceed 100 characters."
                    );
                }

                normalizedKeywords.add(normalized);
            }
        }

        item.setName(name);
        item.setInformation(information);
        item.setKeywords(normalizedKeywords);
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                message
        );
    }
}