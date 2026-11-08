
package com.whichbin.whichbin_api;

import com.whichbin.whichbin_api.model.Resource;
import com.whichbin.whichbin_api.model.ResourceSection;
import com.whichbin.whichbin_api.repository.ResourceRepository;
import com.whichbin.whichbin_api.testutil.IntegrationTestHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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

    private RequestPostProcessor bearerAuth;

    @BeforeEach
    void setUpBearerAuth() {
        bearerAuth = testHelper.bearerAuth();
    }

    @Test
    void shouldReturnEducationalResources() throws Exception {
        saveResource("Test Resource One");
        saveResource("Test Resource Two");

        mockMvc.perform(get("/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage").value(1))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.pageSize").value(10))
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items[*].title",
                        hasItems(
                                "Test Resource One",
                                "Test Resource Two"
                        )));
    }

    @Test
    void shouldReturnSecondPageOfEducationalResources() throws Exception {
        saveResource("Page One Resource");
        saveResource("Page One Resource Two");
        saveResource("Page Two Resource");

        mockMvc.perform(get("/resources")
                        .param("page", "2")
                        .param("pageSize", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage").value(2))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.pageSize").value(2))
                .andExpect(jsonPath("$.totalItems").value(3))
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].title")
                        .value("Page Two Resource"));
    }

    @Test
    void shouldRejectInvalidPaginationParameters() throws Exception {

        mockMvc.perform(get("/resources")
                        .param("page", "0"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/resources")
                        .param("pageSize", "0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnResourceDetails() throws Exception {
        Resource resource = saveResource("Resource Details Test");

        mockMvc.perform(get("/resources/{id}", resource.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(resource.getId()))
                .andExpect(jsonPath("$.title").value("Resource Details Test"))
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

        mockMvc.perform(post("/resources")
                        .with(bearerAuth)
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
        Resource resource = saveResource("Resource To Update");

        mockMvc.perform(put("/resources/{id}", resource.getId())
                        .with(bearerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resourceJson("Updated Recycling Basics")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(resource.getId()))
                .andExpect(jsonPath("$.title").value("Updated Recycling Basics"));
    }

    @Test
    void shouldRejectUpdateWithoutAuthentication() throws Exception {
        Resource resource = saveResource("Resource To Protect");

        mockMvc.perform(put("/resources/{id}", resource.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resourceJson("Updated Resource")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldDeleteResourceWithValidToken() throws Exception {

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
                        .with(bearerAuth))
                .andExpect(status().isNoContent());

        assertFalse(resourceRepository.existsById(resource.getId()));
    }

    @Test
    void shouldRejectDeleteWithoutAuthentication() throws Exception {
        Resource resource = saveResource("Resource To Protect");

        mockMvc.perform(delete("/resources/{id}", resource.getId()))
                .andExpect(status().isUnauthorized());

        assertTrue(resourceRepository.existsById(resource.getId()));
    }

    private Resource saveResource(String title) {
        return resourceRepository.saveAndFlush(
                new Resource(
                        title,
                        "Test description",
                        "Test educational content.",
                        "resource-style-green",
                        null,
                        new ArrayList<>(List.of(
                                new ResourceSection(
                                        "Section One",
                                        "resource-section-green",
                                        "Item one"
                                ),
                                new ResourceSection(
                                        "Section Two",
                                        "resource-section-blue",
                                        "Item two"
                                ),
                                new ResourceSection(
                                        "Section Three",
                                        "resource-section-yellow",
                                        "Item three"
                                ),
                                new ResourceSection(
                                        "Section Four",
                                        "resource-section-red",
                                        "Item four"
                                )
                        ))
                )
        );
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
