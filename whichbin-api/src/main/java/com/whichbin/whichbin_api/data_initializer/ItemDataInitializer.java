package com.whichbin.whichbin_api.data_initializer;

import com.whichbin.whichbin_api.model.Item;
import com.whichbin.whichbin_api.repository.ItemRepository;
import com.whichbin.whichbin_api.service.ItemService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;

/** Development examples for exercising search, filters, and multiple pages. */
@Component
@Profile("dev & !orlando-data")
public class ItemDataInitializer implements CommandLineRunner {
    private final ItemRepository repository;
    private final ItemService service;

    public ItemDataInitializer(ItemRepository repository, ItemService service) {
        this.repository = repository;
        this.service = service;
    }

    @Override
    @Transactional
    public void run(String... args) {
        for (String name : List.of("Aluminum Can", "Steel Food Can", "Plastic Water Bottle",
                "Plastic Soda Bottle", "Plastic Milk Jug", "Plastic Detergent Bottle",
                "Glass Bottle", "Glass Jar", "Cardboard Box", "Cereal Box", "Newspaper",
                "Office Paper")) {
            seed(name, true, false, "Empty containers and keep paper clean and dry. Place recyclables loose in the recycling cart.",
                    Set.of("recycling", name.toLowerCase(java.util.Locale.ROOT)));
        }
        for (String name : List.of("Plastic Bag", "Plastic Wrap", "Foam Cup", "Foam Takeout Box",
                "Ceramic Mug", "Broken Plate", "Paper Towel", "Used Tissue", "Disposable Diaper",
                "Food Scraps", "Garden Hose", "Old Pillow")) {
            seed(name, false, false, "Keep this item out of the recycling cart. Review local disposal or reuse options.",
                    Set.of("non-recyclable", name.toLowerCase(java.util.Locale.ROOT)));
        }
        seed("Metal Filing Cabinet", true, true,
                "This large metal item does not belong in the recycling cart. Review City large item collection guidance.",
                Set.of("metal", "furniture", "bulky"));
    }

    private void seed(String name, boolean recyclable, boolean largeItem,
                      String information, Set<String> keywords) {
        if (repository.existsByNameIgnoreCase(name)) return;
        Item item = new Item();
        item.setName(name);
        item.setRecyclable(recyclable);
        item.setLargeItem(largeItem);
        item.setInformation(information);
        item.setKeywords(keywords);
        service.createItem(item);
    }
}
