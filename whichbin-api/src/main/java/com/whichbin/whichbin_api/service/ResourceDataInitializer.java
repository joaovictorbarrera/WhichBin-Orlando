package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.model.Resource;
import com.whichbin.whichbin_api.model.ResourceSection;
import com.whichbin.whichbin_api.repository.ResourceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ResourceDataInitializer implements CommandLineRunner {

    private final ResourceRepository resourceRepository;

    public ResourceDataInitializer(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public void run(String... args) {
        seedResources();
    }

    private void seedResources() {

        if (resourceRepository.findAll().isEmpty()) {

            Resource recyclingBasics = new Resource(
                    "Recycling Basics",
                    "The essentials of what can and cannot be recycled.",
                    "Learn the basics of recycling in Orlando, including what belongs in your recycling bin and what should stay out.",
                    "resource-style-green",
                    List.of(
                            new ResourceSection(
                                    "What Can Be Recycled?",
                                    "resource-section-green",
                                    "Plastic bottles and containers|Glass bottles and jars|Aluminum, steel, and tin cans|Flattened cardboard boxes|Newspapers, paper bags, junk mail, sheets of paper, and drink cartons"
                            ),
                            new ResourceSection(
                                    "Before You Recycle",
                                    "resource-section-blue",
                                    "Empty and clean plastic containers|Rinse the container and let it dry.|Plastic caps can stay on|Empty and clean glass bottles and jars|Remove metal lids|Empty and clean metal cans|Flatten cardboard boxes"
                            ),
                            new ResourceSection(
                                    "What Does Not Belong?",
                                    "resource-section-red",
                                    "Food waste|Plastic bags|Plastic wrap|Polystyrene foam cups and containers|Aluminum food pans|Household garbage"
                            ),
                            new ResourceSection(
                                    "Remember",
                                    "resource-section-green",
                                    "Do not put recyclables inside plastic bags.|Place recyclables directly into the recycling cart."
                            )
                    )
            );

            Resource howToPrepareItems = new Resource(
                    "How to Prepare Items",
                    "Simple steps to make your items recyclable.",
                    "Learn how to prepare recyclable items before placing them in your recycling bin. Empty containers, rinse them when needed, and keep non-recyclable materials out.",
                    "resource-style-blue",
                    List.of(
                            new ResourceSection(
                                    "Plastic Containers",
                                    "resource-section-blue",
                                    "Empty the container.|Rinse the container and let it dry.|Plastic caps can stay on."
                            ),
                            new ResourceSection(
                                    "Glass Containers",
                                    "resource-section-blue",
                                    "Empty and clean the container.|Remove metal lids.|Place glass bottles and jars loose in the recycling cart."
                            ),
                            new ResourceSection(
                                    "Cans",
                                    "resource-section-blue",
                                    "Empty the can.|Rinse the can and let it dry.|Recycle aluminum, steel, and tin cans."
                            ),
                            new ResourceSection(
                                    "Cardboard",
                                    "resource-section-blue",
                                    "Flatten cardboard boxes.|Keep cardboard clean and dry.|Do not recycle greasy or food-soiled cardboard."
                            ),
                            new ResourceSection(
                                    "One Important Rule",
                                    "resource-section-green",
                                    "Keep recyclables loose.|Do not put recyclables inside plastic bags."
                            )
                    )
            );

            Resource commonMistakes = new Resource(
                    "Common Mistakes",
                    "Avoid these common recycling mistakes.",
                    "Learn about common recycling mistakes such as placing plastic bags, food waste, liquids, and other non-recyclable materials in the recycling bin.",
                    "resource-style-orange",
                    List.of(
                            new ResourceSection(
                                    "Putting Recyclables in Bags",
                                    "resource-section-orange",
                                    "Do not put recyclables inside plastic bags.|Place recyclable items directly into the recycling cart.|Plastic bags can get tangled in recycling equipment."
                            ),
                            new ResourceSection(
                                    "Recycling Food Waste",
                                    "resource-section-red",
                                    "Food waste does not belong in the recycling cart.|Empty food and drink containers before recycling them.|Keep food and other household garbage out of the recycling cart."
                            ),
                            new ResourceSection(
                                    "Recycling Plastic Bags and Wrap",
                                    "resource-section-red",
                                    "Plastic bags do not belong in the recycling cart.|Plastic wrap and film plastic should not be placed in the recycling cart."
                            ),
                            new ResourceSection(
                                    "Recycling Styrofoam",
                                    "resource-section-red",
                                    "Styrofoam cups and containers do not belong in the recycling cart.|Keep foam packing materials out of the recycling cart."
                            ),
                            new ResourceSection(
                                    "Recycling Contaminated Items",
                                    "resource-section-orange",
                                    "Empty and clean recyclable containers before placing them in the cart.|Do not put household garbage in the recycling cart.|When in doubt, check the item before putting it in the recycling cart."
                            )
                    )
            );

            Resource orlandoGuide = new Resource(
                    "Orlando Recycling Guide",
                    "Full details from the City of Orlando.",
                    "Learn the recycling guidelines for Orlando, including what materials are accepted, how to prepare items, and how to avoid contamination.",
                    "resource-style-purple",
                    List.of(
                            new ResourceSection(
                                    "What Goes in the Recycling Cart?",
                                    "resource-section-green",
                                    "Plastic bottles and containers|Glass bottles and jars|Aluminum, steel, and tin cans|Flattened cardboard|Paper and drink cartons"
                            ),
                            new ResourceSection(
                                    "Keep It Clean",
                                    "resource-section-blue",
                                    "Empty containers before recycling them.|Rinse containers when needed and let them dry.|Keep food and other garbage out of the recycling cart."
                            ),
                            new ResourceSection(
                                    "Keep It Loose",
                                    "resource-section-blue",
                                    "Place recyclable items directly into the recycling cart.|Do not put recyclables inside plastic bags.|Plastic bags and plastic film do not belong in the recycling cart."
                            ),
                            new ResourceSection(
                                    "Items to Keep Out",
                                    "resource-section-red",
                                    "Food waste|Plastic bags and film|Polystyrene foam|Aluminum food pans|Household garbage"
                            ),
                            new ResourceSection(
                                    "When You Are Not Sure",
                                    "resource-section-orange",
                                    "Check the item before putting it in the recycling cart.|Use the WhichBin Orlando item search to help decide where an item belongs."
                            )
                    )
            );

            resourceRepository.save(recyclingBasics);
            resourceRepository.save(howToPrepareItems);
            resourceRepository.save(commonMistakes);
            resourceRepository.save(orlandoGuide);
        }
    }
}