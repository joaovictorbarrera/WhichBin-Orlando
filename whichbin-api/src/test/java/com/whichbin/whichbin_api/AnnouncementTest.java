
package com.whichbin.whichbin_api;

import com.whichbin.whichbin_api.testutil.IntegrationTestHelper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class AnnouncementTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IntegrationTestHelper testHelper;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateAnnouncement() throws Exception {

        String token = testHelper.getAuthToken();

        String announcementJson = """
            {
                "title": "Test Recycling Announcement",
                "message": "This is a test announcement.",
                "type": "GENERAL",
                "startDate": "2026-10-20T08:00:00",
                "endDate": "2026-12-20T08:00:00",
                "active": true
            }
            """;

        mockMvc.perform(post("/announcements")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(announcementJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title")
                        .value("Test Recycling Announcement"))
                .andExpect(jsonPath("$.type").value("GENERAL"))
                .andExpect(jsonPath("$.active").value(true));
    }
    @Test
    void shouldCreateAndRetrieveAnnouncementById() throws Exception {

        String token = testHelper.getAuthToken();

        String announcementJson = """
        {
            "title": "Recycling Pickup Reminder",
            "message": "Remember to place your recycling bin outside.",
            "type": "GENERAL",
            "startDate": "2026-10-20T08:00:00",
            "endDate": "2026-12-20T08:00:00",
            "active": true
        }
        """;

        // Step 1: Create an announcement
        String response = mockMvc.perform(post("/announcements")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(announcementJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Step 2: Get the generated announcement ID
        Long announcementId = objectMapper.readTree(response)
                .get("id")
                .asLong();

        // Step 3: Retrieve the announcement by its ID
        mockMvc.perform(get("/announcements/{id}", announcementId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(announcementId))
                .andExpect(jsonPath("$.title")
                        .value("Recycling Pickup Reminder"))
                .andExpect(jsonPath("$.message")
                        .value("Remember to place your recycling bin outside."))
                .andExpect(jsonPath("$.type").value("GENERAL"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldNotShowFutureAnnouncement() throws Exception {

        String token = testHelper.getAuthToken();

        String futureDate = java.time.LocalDateTime.now()
                .plusDays(7).toString();

        String endDate = java.time.LocalDateTime.now()
                .plusDays(14).toString();

        String announcementJson = """
        {
            "title": "Future Recycling Announcement",
            "message": "This announcement should not be visible yet.",
            "type": "GENERAL",
            "startDate": "%s",
            "endDate": "%s",
            "active": true
        }
        """.formatted(futureDate, endDate);

        // Create a future announcement
        String response = mockMvc.perform(post("/announcements")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(announcementJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long announcementId = objectMapper.readTree(response)
                .get("id")
                .asLong();

        // Get the public announcements
        mockMvc.perform(get("/announcements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + announcementId + ")]")
                        .isEmpty());
    }

    @Test
    void shouldNotShowInactiveAnnouncement() throws Exception {

        String token = testHelper.getAuthToken();

        String startDate = java.time.LocalDateTime.now()
                .minusDays(1).toString();

        String endDate = java.time.LocalDateTime.now()
                .plusDays(7).toString();

        String announcementJson = """
        {
            "title": "Inactive Recycling Announcement",
            "message": "This announcement should not be visible.",
            "type": "GENERAL",
            "startDate": "%s",
            "endDate": "%s",
            "active": false
        }
        """.formatted(startDate, endDate);

        // Create an inactive announcement
        String response = mockMvc.perform(post("/announcements")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(announcementJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long announcementId = objectMapper.readTree(response)
                .get("id")
                .asLong();

        // Check that it does not appear in the public list
        mockMvc.perform(get("/announcements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + announcementId + ")]")
                        .isEmpty());
    }

    @Test
    void shouldNotShowExpiredAnnouncement() throws Exception {

        String token = testHelper.getAuthToken();

        String startDate = java.time.LocalDateTime.now()
                .minusDays(14).toString();

        String endDate = java.time.LocalDateTime.now()
                .minusDays(7).toString();

        String announcementJson = """
        {
            "title": "Expired Recycling Announcement",
            "message": "This announcement has already expired.",
            "type": "GENERAL",
            "startDate": "%s",
            "endDate": "%s",
            "active": true
        }
        """.formatted(startDate, endDate);

        // Create an expired announcement
        String response = mockMvc.perform(post("/announcements")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(announcementJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long announcementId = objectMapper.readTree(response)
                .get("id")
                .asLong();

        // Check that the expired announcement is not public
        mockMvc.perform(get("/announcements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + announcementId + ")]")
                        .isEmpty());
    }

    @Test
    void shouldShowCurrentAnnouncement() throws Exception {

        String token = testHelper.getAuthToken();

        String startDate = java.time.LocalDateTime.now()
                .minusDays(1).toString();

        String endDate = java.time.LocalDateTime.now()
                .plusDays(7).toString();

        String announcementJson = """
        {
            "title": "Current Recycling Announcement",
            "message": "Recycling collection is available this week.",
            "type": "GENERAL",
            "startDate": "%s",
            "endDate": "%s",
            "active": true
        }
        """.formatted(startDate, endDate);

        // Create an announcement that is currently active
        String response = mockMvc.perform(post("/announcements")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(announcementJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long announcementId = objectMapper.readTree(response)
                .get("id")
                .asLong();

        // Verify the announcement appears in the public list
        mockMvc.perform(get("/announcements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + announcementId + ")]")
                        .isNotEmpty())
                .andExpect(jsonPath("$[?(@.title == 'Current Recycling Announcement')]")
                        .isNotEmpty());
    }

    @Test
    void shouldFilterAnnouncementsByType() throws Exception {

        String token = testHelper.getAuthToken();

        String startDate = java.time.LocalDateTime.now()
                .minusDays(1).toString();

        String endDate = java.time.LocalDateTime.now()
                .plusDays(7).toString();

        // Create a GENERAL announcement
        String generalJson = """
        {
            "title": "General Recycling Notice",
            "message": "General recycling information.",
            "type": "GENERAL",
            "startDate": "%s",
            "endDate": "%s",
            "active": true
        }
        """.formatted(startDate, endDate);

        String generalResponse = mockMvc.perform(post("/announcements")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(generalJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long generalId = objectMapper.readTree(generalResponse)
                .get("id")
                .asLong();

        // Create a SERVICE_ALERT announcement
        String serviceJson = """
        {
            "title": "Service Alert Notice",
            "message": "Temporary recycling service alert.",
            "type": "SERVICE_ALERT",
            "startDate": "%s",
            "endDate": "%s",
            "active": true
        }
        """.formatted(startDate, endDate);

        String serviceResponse = mockMvc.perform(post("/announcements")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(serviceJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long serviceId = objectMapper.readTree(serviceResponse)
                .get("id")
                .asLong();

        // Request only GENERAL announcements
        mockMvc.perform(get("/announcements")
                        .param("type", "GENERAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + generalId + ")]").isNotEmpty())
                .andExpect(jsonPath("$[?(@.id == " + serviceId + ")]").isEmpty())
                .andExpect(jsonPath("$[*].type",
                        org.hamcrest.Matchers.everyItem(
                                org.hamcrest.Matchers.is("GENERAL"))));
    }

    @Test
    void shouldUpdateAnnouncement() throws Exception {

        String token = testHelper.getAuthToken();

        String startDate = java.time.LocalDateTime.now()
                .minusDays(1).toString();

        String endDate = java.time.LocalDateTime.now()
                .plusDays(7).toString();

        // Create the original announcement
        String originalJson = """
        {
            "title": "Original Recycling Notice",
            "message": "Original announcement message.",
            "type": "GENERAL",
            "startDate": "%s",
            "endDate": "%s",
            "active": true
        }
        """.formatted(startDate, endDate);

        String response = mockMvc.perform(post("/announcements")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(originalJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long announcementId = objectMapper.readTree(response)
                .get("id")
                .asLong();

        // Update the announcement
        String updatedJson = """
        {
            "title": "Updated Recycling Notice",
            "message": "Updated announcement message.",
            "type": "SERVICE_ALERT",
            "startDate": "%s",
            "endDate": "%s",
            "active": false
        }
        """.formatted(startDate, endDate);

        mockMvc.perform(put("/announcements/{id}", announcementId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(announcementId))
                .andExpect(jsonPath("$.title").value("Updated Recycling Notice"))
                .andExpect(jsonPath("$.message").value("Updated announcement message."))
                .andExpect(jsonPath("$.type").value("SERVICE_ALERT"))
                .andExpect(jsonPath("$.active").value(false));

        // Retrieve it again to verify the update was saved
        mockMvc.perform(get("/announcements/{id}", announcementId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Recycling Notice"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void shouldDeleteAnnouncement() throws Exception {

        String token = testHelper.getAuthToken();

        String startDate = java.time.LocalDateTime.now()
                .minusDays(1).toString();

        String endDate = java.time.LocalDateTime.now()
                .plusDays(7).toString();

        // Create an announcement
        String announcementJson = """
        {
            "title": "Announcement To Delete",
            "message": "This announcement will be deleted.",
            "type": "GENERAL",
            "startDate": "%s",
            "endDate": "%s",
            "active": true
        }
        """.formatted(startDate, endDate);

        String response = mockMvc.perform(post("/announcements")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(announcementJson))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long announcementId = objectMapper.readTree(response)
                .get("id")
                .asLong();

        // Delete the announcement
        mockMvc.perform(delete("/announcements/{id}", announcementId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        // Verify it no longer exists
        mockMvc.perform(get("/announcements/{id}", announcementId))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnNotFoundForInvalidAnnouncementId() throws Exception {

        // Request an announcement with an ID that does not exist
        mockMvc.perform(get("/announcements/{id}", -1))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldNotAllowUnauthorizedAnnouncementCreation() throws Exception {

        String announcementJson = """
        {
            "title": "Unauthorized Announcement",
            "message": "This should not be created.",
            "type": "GENERAL",
            "startDate": "2026-10-20T08:00:00",
            "endDate": "2026-12-20T08:00:00",
            "active": true
        }
        """;

        // Attempt to create without an authentication token
        mockMvc.perform(post("/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(announcementJson))
                .andExpect(status().isUnauthorized());
    }
}


