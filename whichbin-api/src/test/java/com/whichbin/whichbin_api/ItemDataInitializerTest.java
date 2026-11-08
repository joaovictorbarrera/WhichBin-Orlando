package com.whichbin.whichbin_api;

import com.whichbin.whichbin_api.data_initializer.ItemDataInitializer;
import com.whichbin.whichbin_api.model.Item;
import com.whichbin.whichbin_api.repository.ItemRepository;
import com.whichbin.whichbin_api.service.ItemService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.annotation.Profile;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ItemDataInitializerTest {
    @Test
    void shouldSeedValidExamplesWithoutDuplicatesOnRestart() {
        ItemRepository repository = mock(ItemRepository.class);
        ItemService service = mock(ItemService.class);
        Set<String> names = new HashSet<>();
        when(repository.existsByNameIgnoreCase(anyString()))
                .thenAnswer(call -> names.contains(call.getArgument(0)));
        when(service.createItem(any())).thenAnswer(call -> {
            Item item = call.getArgument(0);
            names.add(item.getName());
            return item;
        });

        var initializer = new ItemDataInitializer(repository, service);
        initializer.run();
        initializer.run();

        ArgumentCaptor<Item> items = ArgumentCaptor.forClass(Item.class);
        verify(service, times(25)).createItem(items.capture());

        assertEquals(25, names.size());
        assertTrue(items.getAllValues().stream()
                .filter(Item::getRecyclable)
                .count() > 10);
        assertTrue(items.getAllValues().stream()
                .filter(item -> !item.getRecyclable())
                .count() > 10);
        assertTrue(items.getAllValues().stream().anyMatch(Item::getLargeItem));
        for (Item item : items.getAllValues()) {
            assertFalse(item.getInformation().isBlank());
            assertFalse(item.getKeywords().isEmpty());
        }
    }

    @Test
    void shouldPreserveExistingItemsAndRunOnlyInDev() {
        ItemRepository repository = mock(ItemRepository.class);
        ItemService service = mock(ItemService.class);
        when(repository.existsByNameIgnoreCase(anyString())).thenReturn(true);

        new ItemDataInitializer(repository, service).run();

        verifyNoInteractions(service);
        assertArrayEquals(new String[]{"dev & !orlando-data"},
                ItemDataInitializer.class.getAnnotation(Profile.class).value());
    }
}
