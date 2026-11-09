package com.whichbin.whichbin_api.data_initializer;

import com.whichbin.whichbin_api.model.Item;
import com.whichbin.whichbin_api.repository.ItemRepository;
import com.whichbin.whichbin_api.service.ItemService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Component
@Profile("orlando-data")
public class OrlandoItemImporter implements CommandLineRunner {
    private final ItemRepository repository;
    private final ItemService service;
    private final ObjectMapper mapper;

    public OrlandoItemImporter(ItemRepository repository, ItemService service, ObjectMapper mapper) {
        this.repository = repository;
        this.service = service;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try (var stream = new ClassPathResource("data/orlando-items.json").getInputStream()) {
            Item[] items = mapper.readValue(stream, Item[].class);
            for (Item item : items) {
                if (!repository.existsByNameIgnoreCase(item.getName())) {
                    service.createItem(item);
                }
            }
        }
    }
}
