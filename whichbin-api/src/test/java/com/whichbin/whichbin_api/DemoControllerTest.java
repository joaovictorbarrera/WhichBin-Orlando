package com.whichbin.whichbin_api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class DemoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnPageAndPaginationMetadata() throws Exception {
        mockMvc.perform(get("/demo/items")
                        .param("filter", "All")
                        .param("page", "2")
                        .param("pageSize", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage").value(2))
                .andExpect(jsonPath("$.totalPages").value(10))
                .andExpect(jsonPath("$.pageSize").value(5))
                .andExpect(jsonPath("$.totalItems").value(47))
                .andExpect(jsonPath("$.items.length()").value(5))
                .andExpect(jsonPath("$.items[0].id").value(6));
    }

    @Test
    void shouldFilterItemsByBin() throws Exception {
        mockMvc.perform(get("/demo/items")
                        .param("filter", "Trash")
                        .param("page", "1")
                        .param("pageSize", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(13))
                .andExpect(jsonPath("$.items.length()").value(13))
                .andExpect(jsonPath("$.items[0].bin").value("Trash"));
    }

    @Test
    void shouldReturnEmptyItemsForPageBeyondLastPage() throws Exception {
        mockMvc.perform(get("/demo/items")
                        .param("filter", "All")
                        .param("page", "100")
                        .param("pageSize", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage").value(100))
                .andExpect(jsonPath("$.totalPages").value(10))
                .andExpect(jsonPath("$.totalItems").value(47))
                .andExpect(jsonPath("$.items").isEmpty());
    }

    @Test
    void shouldRejectInvalidPageNumber() throws Exception {
        mockMvc.perform(get("/demo/items")
                        .param("filter", "All")
                        .param("page", "0")
                        .param("pageSize", "5"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldDelaySuccessfulResponsesByAtLeast500Milliseconds()
            throws Exception {
        long startTime = System.nanoTime();

        mockMvc.perform(get("/demo/items")
                        .param("filter", "All")
                        .param("page", "1")
                        .param("pageSize", "5"))
                .andExpect(status().isOk());

        long elapsedMillis = (System.nanoTime() - startTime) / 1_000_000;

        assertTrue(elapsedMillis >= 500,
                "Expected response to take at least 500 ms but took "
                        + elapsedMillis + " ms");
    }
}
