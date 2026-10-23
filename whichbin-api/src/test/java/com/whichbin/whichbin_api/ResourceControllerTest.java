
package com.whichbin.whichbin_api;

import com.whichbin.whichbin_api.model.Resource;
import com.whichbin.whichbin_api.repository.ResourceRepository;
import com.whichbin.whichbin_api.testutil.IntegrationTestHelper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasItems;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private IntegrationTestHelper testHelper;

    @Test
    void shouldReturnEducationalResources() throws Exception {
        mockMvc.perform(get("/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].title",
                        hasItems(
                                "Recycling Basics",
                                "How to Prepare Items",
                                "Common Mistakes",
                                "Orlando Recycling Guide"
                        )));
    }

    @Test
    void shouldReturnResourceDetails() throws Exception {
        Resource resource = resourceRepository
                .findByTitle("Recycling Basics")
                .orElseThrow();

        mockMvc.perform(get("/resources/{id}", resource.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(resource.getId()))
                .andExpect(jsonPath("$.title").value("Recycling Basics"))
                .andExpect(jsonPath("$.sections.length()").value(4));
    }

    @Test
    void shouldReturnNotFoundForMissingResource() throws Exception {
        mockMvc.perform(get("/resources/{id}", 999999999L))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRequireAuthenticationToCreateResource() throws Exception {
        mockMvc.perform(post("/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resourceJson("New Resource")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldCreateResourceWithValidToken() throws Exception {
        String token = testHelper.getAuthToken();

        mockMvc.perform(post("/resources")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resourceJson("New Resource")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("New Resource"))
                .andExpect(jsonPath("$.content")
                        .value("Test educational content."));
    }

    @Test
    void shouldUpdateExistingResource() throws Exception {
        String token = testHelper.getAuthToken();

        Resource resource = resourceRepository
                .findByTitle("Recycling Basics")
                .orElseThrow();

        mockMvc.perform(put("/resources/{id}", resource.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resourceJson("Updated Recycling Basics")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(resource.getId()))
                .andExpect(jsonPath("$.title")
                        .value("Updated Recycling Basics"));
    }

    @Test
    void shouldRejectUpdateWithoutAuthentication() throws Exception {
        Resource resource = resourceRepository
                .findByTitle("Recycling Basics")
                .orElseThrow();

        mockMvc.perform(put("/resources/{id}", resource.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resourceJson("Updated Resource")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldDeleteResourceWithValidToken() throws Exception {
        String token = testHelper.getAuthToken();

        Resource resource = resourceRepository.saveAndFlush(
                new Resource(
                        "Resource To Delete",
                        "Test description",
                        "Test content",
                        "resource-style-green",
                        null,
                        java.util.List.of()
                )
        );

        mockMvc.perform(delete("/resources/{id}", resource.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        assertFalse(resourceRepository.existsById(resource.getId()));
    }

    @Test
    void shouldRejectDeleteWithoutAuthentication() throws Exception {
        Resource resource = resourceRepository
                .findByTitle("Recycling Basics")
                .orElseThrow();

        mockMvc.perform(delete("/resources/{id}", resource.getId()))
                .andExpect(status().isUnauthorized());

        assertTrue(resourceRepository.existsById(resource.getId()));
    }

    private String resourceJson(String title) {
        return """
                {
                    "title": "%s",
                    "description": "Test description",
                    "content": "Test educational content.",
                    "styleType": "resource-style-green",
                    "pdfUrl": null,
                    "sections": []
                }
                """.formatted(title);
    }
}
