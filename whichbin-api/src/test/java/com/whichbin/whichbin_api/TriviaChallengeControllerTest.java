
package com.whichbin.whichbin_api;

import com.whichbin.whichbin_api.model.TriviaChallenge;
import com.whichbin.whichbin_api.repository.TriviaChallengeRepository;
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

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertFalse;
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
class TriviaChallengeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TriviaChallengeRepository challengeRepository;

    @Autowired
    private IntegrationTestHelper testHelper;

    private RequestPostProcessor bearerAuth;

    @BeforeEach
    void setUpBearerAuth() {
        bearerAuth = testHelper.bearerAuth();
    }

    @Test
    void shouldReturnOnlyActiveChallengesPublicly() throws Exception {

        TriviaChallenge active =
                saveChallenge("Active Test Challenge", true);

        TriviaChallenge inactive =
                saveChallenge("Inactive Test Challenge", false);

        mockMvc.perform(get("/resources/trivia/challenges"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage").value(1))
                .andExpect(jsonPath("$.pageSize").value(5))
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[*].id",
                        hasItem(active.getId().intValue())))
                .andExpect(jsonPath("$.items[*].id",
                        not(hasItem(inactive.getId().intValue()))))
                // Verify the simplified public response fields.
                .andExpect(jsonPath("$.items[0].title")
                        .value("Active Test Challenge"))
                .andExpect(jsonPath("$.items[0].description")
                        .value("Test challenge description"))
                // Verify full challenge fields are excluded.
                .andExpect(jsonPath("$.items[0].active").doesNotExist())
                .andExpect(jsonPath("$.items[0].questions").doesNotExist());
    }

    @Test
    void shouldReturnAnActiveChallengeById() throws Exception {

        TriviaChallenge challenge =
                saveChallenge("Visible Challenge", true);

        mockMvc.perform(get(
                        "/resources/trivia/challenges/{id}",
                        challenge.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(challenge.getId()))
                .andExpect(jsonPath("$.title").value("Visible Challenge"))
                .andExpect(jsonPath("$.description")
                        .value("Test challenge description"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldRejectOpeningAnInactiveChallenge() throws Exception {

        TriviaChallenge challenge =
                saveChallenge("Hidden Challenge", false);

        mockMvc.perform(get(
                        "/resources/trivia/challenges/{id}",
                        challenge.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnNotFoundForMissingChallenge() throws Exception {

        mockMvc.perform(get(
                        "/resources/trivia/challenges/{id}",
                        999999999L))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRequireAuthenticationToListAllChallenges()
            throws Exception {

        mockMvc.perform(get("/resources/trivia/challenges/all"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnAllChallengesWithValidToken() throws Exception {

        TriviaChallenge challenge =
                saveChallenge("Admin Visible Challenge", false);

        mockMvc.perform(get("/resources/trivia/challenges/all")
                        .with(bearerAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage").value(1))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.pageSize").value(10))
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[*].id").value(
                        hasItem(challenge.getId().intValue())
                ))
                // Admin response must retain full challenge fields.
                .andExpect(jsonPath("$.items[0].title")
                        .value("Admin Visible Challenge"))
                .andExpect(jsonPath("$.items[0].description")
                        .value("Test challenge description"))
                .andExpect(jsonPath("$.items[0].active").value(false))
                .andExpect(jsonPath("$.items[0].questions").exists());
    }

    @Test
    void shouldCreateChallengeAsInactive() throws Exception {

        mockMvc.perform(post("/resources/trivia/challenges")
                        .with(bearerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "New Test Challenge",
                                    "description": "Test challenge description",
                                    "active": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title")
                        .value("New Test Challenge"))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void shouldUpdateChallengeAndItsActiveStatus() throws Exception {

        TriviaChallenge challenge =
                saveChallenge("Challenge Before Update", false);

        mockMvc.perform(put(
                        "/resources/trivia/challenges/{id}",
                        challenge.getId())
                        .with(bearerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Challenge After Update",
                                    "description": "Updated description",
                                    "active": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title")
                        .value("Challenge After Update"))
                .andExpect(jsonPath("$.description")
                        .value("Updated description"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldDeleteChallengeWithValidToken() throws Exception {

        TriviaChallenge challenge =
                saveChallenge("Challenge To Delete", false);

        mockMvc.perform(delete(
                        "/resources/trivia/challenges/{id}",
                        challenge.getId())
                        .with(bearerAuth))
                .andExpect(status().isNoContent());

        assertFalse(challengeRepository.existsById(challenge.getId()));
    }

    @Test
    void shouldRejectChallengeCreationWithoutAuthentication()
            throws Exception {

        mockMvc.perform(post("/resources/trivia/challenges")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Unauthorized Challenge",
                                    "description": "Should not be created",
                                    "active": false
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectInvalidPublicPaginationParameters()
            throws Exception {

        mockMvc.perform(get("/resources/trivia/challenges")
                        .param("page", "0"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/resources/trivia/challenges")
                        .param("pageSize", "0"))
                .andExpect(status().isBadRequest());
    }

    private TriviaChallenge saveChallenge(
            String title,
            boolean active) {

        TriviaChallenge challenge =
                new TriviaChallenge(title, "Test challenge description");

        challenge.setActive(active);

        return challengeRepository.saveAndFlush(challenge);
    }
}
