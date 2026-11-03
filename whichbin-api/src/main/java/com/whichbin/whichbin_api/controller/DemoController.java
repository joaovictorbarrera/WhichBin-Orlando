package com.whichbin.whichbin_api.controller;

import com.whichbin.whichbin_api.dto.PaginatedResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/demo")
public class DemoController {

    private static final long RESPONSE_DELAY_MILLIS = 500;
    private static final List<DemoItem> DEMO_ITEMS = createDemoItems();

    @GetMapping("/items")
    public PaginatedResponse<DemoItem> getItems(
            @RequestParam String filter,
            @RequestParam int page,
            @RequestParam int pageSize
    ) {
        if (page < 1 || pageSize < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page and pageSize must be greater than zero"
            );
        }

        if (!filter.equals("All")
                && !filter.equals("Recycling")
                && !filter.equals("Trash")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Filter must be All, Recycling, or Trash"
            );
        }

        List<DemoItem> filteredItems = filter.equals("All")
                ? DEMO_ITEMS
                : DEMO_ITEMS.stream()
                        .filter(item -> item.bin().equals(filter))
                        .toList();

        long totalItems = filteredItems.size();
        int totalPages = (int) ((totalItems + pageSize - 1L) / pageSize);
        long firstItemIndex = (long) (page - 1) * pageSize;
        List<DemoItem> pageItems = firstItemIndex >= totalItems
                ? List.of()
                : filteredItems.subList(
                        (int) firstItemIndex,
                        (int) Math.min(firstItemIndex + pageSize, totalItems)
                );

        delayResponse();

        return new PaginatedResponse<>(
                page,
                totalPages,
                pageSize,
                totalItems,
                pageItems
        );
    }

    private static void delayResponse() {
        try {
            Thread.sleep(RESPONSE_DELAY_MILLIS);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Demo response delay was interrupted",
                    exception
            );
        }
    }

    private static List<DemoItem> createDemoItems() {
        List<DemoItem> examples = List.of(
                new DemoItem(0, "Glass beverage bottle", "Glass", "Recycling"),
                new DemoItem(0, "Cardboard shipping box", "Paper", "Recycling"),
                new DemoItem(0, "Plastic water bottle", "Plastic", "Recycling"),
                new DemoItem(0, "Used paper towel", "Paper", "Trash"),
                new DemoItem(0, "Aluminum drink can", "Metal", "Recycling"),
                new DemoItem(0, "Food-soiled pizza box", "Paper", "Trash"),
                new DemoItem(0, "Empty cleaning bottle", "Plastic", "Recycling")
        );

        return IntStream.range(0, 47)
                .mapToObj(index -> {
                    DemoItem example = examples.get(index % examples.size());
                    return new DemoItem(
                            index + 1,
                            example.name(),
                            example.category(),
                            example.bin()
                    );
                })
                .toList();
    }

    public record DemoItem(int id, String name, String category, String bin) {
    }
}
