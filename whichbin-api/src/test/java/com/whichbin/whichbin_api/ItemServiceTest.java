package com.whichbin.whichbin_api;

import com.whichbin.whichbin_api.model.Item;
import com.whichbin.whichbin_api.repository.ItemRepository;
import com.whichbin.whichbin_api.service.ItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.util.function.Consumer;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ItemServiceTest {
    private ItemRepository repository;
    private ItemService service;

    @BeforeEach
    void setUp() {
        repository = mock(ItemRepository.class);
        service = new ItemService(repository);
    }

    private Item validItem() {
        Item item = new Item();
        item.setName("  Plastic Bottle  ");
        item.setRecyclable(true);
        item.setInformation("  Empty and rinse.  ");
        item.setKeywords(new LinkedHashSet<>(List.of(" Plastic ", "PLASTIC", "bottle")));
        return item;
    }

    @Test
    void createsNormalizedItemIgnoringClientId() {
        Item input = validItem();
        input.setId(99L);
        when(repository.saveAndFlush(any(Item.class))).thenAnswer(call -> call.getArgument(0));
        Item result = service.createItem(input);
        assertNull(result.getId());
        assertEquals("Plastic Bottle", result.getName());
        assertEquals("Empty and rinse.", result.getInformation());
        assertEquals(Set.of("plastic", "bottle"), result.getKeywords());
    }

    @Test
    void updatesExistingItemAndReplacesKeywords() {
        Item existing = validItem();
        existing.setId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.saveAndFlush(existing)).thenReturn(existing);
        Item input = validItem();
        input.setName("Glass Jar");
        input.setKeywords(Set.of("glass"));
        Item result = service.updateItem(1L, input);
        assertEquals(1L, result.getId());
        assertEquals("Glass Jar", result.getName());
        assertEquals(Set.of("glass"), result.getKeywords());
    }

    @Test
    void retrievesAndDeletesExistingItem() {
        Item item = validItem();
        when(repository.findById(1L)).thenReturn(Optional.of(item));
        assertSame(item, service.getItemById(1L).orElseThrow());
        service.deleteItem(1L);
        verify(repository).delete(item);
    }

    @Test
    void reportsMissingItemsWithoutWriting() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertTrue(service.getItemById(1L).isEmpty());
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException.class,
                () -> service.updateItem(1L, validItem())).getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException.class,
                () -> service.deleteItem(1L)).getStatusCode());
        verify(repository, never()).delete(any());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void normalizesSearchAndRequestsStableDatabasePagination() {
        var pageable = PageRequest.of(1, 10, Sort.by("name", "id"));
        var expected = new PageImpl<Item>(List.of(), pageable, 0);
        when(repository.searchItems("plastic", false, pageable)).thenReturn(expected);
        assertSame(expected, service.searchItems("  PLASTIC  ", false, 1, 10));
        verify(repository).searchItems("plastic", false, pageable);
    }

    @Test
    void acceptsEmptySearchAndMaximumPageSize() {
        service.searchItems(null, null, 0, 100);
        verify(repository).searchItems("", null, PageRequest.of(0, 100, Sort.by("name", "id")));
    }

    @Test
    void rejectsInvalidPaginationBeforeQuerying() {
        for (int[] args : new int[][]{{-1, 10}, {0, 0}, {0, -1}, {0, 101}}) {
            assertBadRequest(() -> service.searchItems("", null, args[0], args[1]));
        }
        assertBadRequest(() -> service.searchItems("x".repeat(151), null, 0, 10));
        verifyNoInteractions(repository);
    }

    @ParameterizedTest
    @ValueSource(longs = {0, -1})
    void rejectsInvalidIds(long id) {
        assertBadRequest(() -> service.getItemById(id));
        assertBadRequest(() -> service.deleteItem(id));
        assertBadRequest(() -> service.updateItem(id, validItem()));
        verifyNoInteractions(repository);
    }

    @Test
    void rejectsInvalidFieldsWithoutSaving() {
        List<Consumer<Item>> invalidations = List.of(
                i -> i.setName(null), i -> i.setName(" "),
                i -> i.setName("x".repeat(151)), i -> i.setRecyclable(null),
                i -> i.setInformation(null), i -> i.setInformation(" "),
                i -> i.setInformation("x".repeat(5001)),
                i -> i.setKeywords(Set.of(" ")),
                i -> i.setKeywords(new HashSet<>(Arrays.asList((String) null))),
                i -> i.setKeywords(Set.of("x".repeat(101))),
                i -> i.setKeywords(new HashSet<>(java.util.stream.IntStream.range(0, 21)
                        .mapToObj(Integer::toString).toList())));
        assertBadRequest(() -> service.createItem(null));
        for (Consumer<Item> invalidation : invalidations) {
            Item input = validItem();
            invalidation.accept(input);
            assertBadRequest(() -> service.createItem(input));
        }
        verifyNoInteractions(repository);
    }

    private void assertBadRequest(Runnable action) {
        assertEquals(HttpStatus.BAD_REQUEST,
                assertThrows(ResponseStatusException.class, action::run).getStatusCode());
    }
}
