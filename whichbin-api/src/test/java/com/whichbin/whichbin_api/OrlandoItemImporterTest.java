package com.whichbin.whichbin_api;

import com.whichbin.whichbin_api.data_initializer.OrlandoItemImporter;
import com.whichbin.whichbin_api.model.DisposalMethod;
import com.whichbin.whichbin_api.model.Item;
import com.whichbin.whichbin_api.repository.ItemRepository;
import com.whichbin.whichbin_api.service.ItemService;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrlandoItemImporterTest {
    @Test
    void shouldImportCatalogPreserveExistingRecordsAndBeRepeatable() throws Exception {
        ItemRepository repository = mock(ItemRepository.class);
        Map<String, Item> saved = new HashMap<>();
        Item existing = new Item();
        existing.setName("Glass bottle");
        existing.setInformation("Administrator edited guidance");
        saved.put("glass bottle", existing);
        when(repository.existsByNameIgnoreCase(anyString()))
                .thenAnswer(call -> saved.containsKey(
                        ((String) call.getArgument(0)).toLowerCase(Locale.ROOT)));

        when(repository.saveAndFlush(any(Item.class))).thenAnswer(call -> {
            Item item = call.getArgument(0);
            saved.put(item.getName().toLowerCase(Locale.ROOT), item);
            return item;
        });

        var importer = new OrlandoItemImporter(
                repository,
                new ItemService(repository),
                new ObjectMapper());
        importer.run();
        importer.run();

        assertEquals(335, saved.size());
        verify(repository, times(334)).saveAndFlush(any(Item.class));
        assertSame(existing, saved.get("glass bottle"));
        assertEquals(
                DisposalMethod.HAZARDOUS_WASTE,
                saved.get("acids").getDisposalMethod());
        assertFalse(saved.get("acids").getRecyclable());
        assertTrue(saved.get("plastic water bottle").getRecyclable());
        assertTrue(saved.get("air conditioner").getLargeItem());
        assertEquals(
                DisposalMethod.MULTIPLE_METHODS,
                saved.get("food scraps").getDisposalMethod());
        String cityGuidanceUrl =
                "https://www.orlando.gov/Trash-Recycling/What-Goes-Where";
        String[] cityGuidanceItems = {
                "camera",
                "computer peripherals",
                "copier",
                "typewriter",
                "vcr player"
        };
        for (String name : cityGuidanceItems) {
            assertEquals(
                    DisposalMethod.CHECK_CITY_GUIDANCE,
                    saved.get(name).getDisposalMethod());
            assertTrue(saved.get(name).getInformation()
                    .contains(cityGuidanceUrl));
        }
        assertTrue(saved.get("acids").getInformation()
                .contains("5901 Young Pine Road"));
    }
}
