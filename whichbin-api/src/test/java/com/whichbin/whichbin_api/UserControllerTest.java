package com.whichbin.whichbin_api;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.whichbin.whichbin_api.testutil.IntegrationTestHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IntegrationTestHelper testHelper;

    private RequestPostProcessor bearerAuth;

    @BeforeEach
    void setUp() {
        bearerAuth = testHelper.bearerAuth();
    }

    private String uniqueEmail() {
        return "users-test-" + UUID.randomUUID() + "@example.com";
    }

    private String userJson(String first, String last, String email) {
        return """
                {"firstName":"%s","lastName":"%s","email":"%s"}
                """.formatted(first, last, email);
    }

    private MvcResult createUser(String email) throws Exception {
        return mockMvc.perform(post("/users")
                        .with(bearerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("Test", "Person", email)))
                .andExpect(status().isCreated())
                .andReturn();
    }

    private JsonNode json(MvcResult result) throws Exception {
        return objectMapper.readTree(
                result.getResponse().getContentAsString()
        );
    }

    @Test
    void shouldCreateUser() throws Exception {
        String email = uniqueEmail();

        JsonNode user = json(createUser(email));

        assertTrue(user.get("id").asLong() > 0);
        assertEquals("Test", user.get("firstName").asText());
        assertEquals("Person", user.get("lastName").asText());
        assertEquals(email, user.get("email").asText());
        assertFalse(user.get("invitationToken").asText().isBlank());
    }

    @Test
    void shouldListUsers() throws Exception {
        String email = uniqueEmail();
        createUser(email);

        mockMvc.perform(get("/users").with(bearerAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email == '" + email + "')]").exists());
    }

    @Test
    void shouldRetrieveUserById() throws Exception {
        JsonNode created = json(createUser(uniqueEmail()));
        long id = created.get("id").asLong();

        mockMvc.perform(get("/users/{id}", id).with(bearerAuth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.firstName").value("Test"));
    }

    @Test
    void shouldUpdateUser() throws Exception {
        JsonNode created = json(createUser(uniqueEmail()));
        long id = created.get("id").asLong();
        String newEmail = uniqueEmail();

        mockMvc.perform(put("/users/{id}", id)
                        .with(bearerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("Updated", "Person", newEmail)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"))
                .andExpect(jsonPath("$.email").value(newEmail));
    }

    @Test
    void shouldDeleteUser() throws Exception {
        JsonNode created = json(createUser(uniqueEmail()));
        long id = created.get("id").asLong();

        mockMvc.perform(delete("/users/{id}", id).with(bearerAuth))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/users/{id}", id).with(bearerAuth))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectDuplicateEmail() throws Exception {
        String email = uniqueEmail();
        createUser(email);

        mockMvc.perform(post("/users")
                        .with(bearerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("Another", "Person", email)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectDuplicateEmailOnUpdate() throws Exception {
        String existingEmail = uniqueEmail();
        createUser(existingEmail);

        JsonNode second = json(createUser(uniqueEmail()));

        mockMvc.perform(put("/users/{id}", second.get("id").asLong())
                        .with(bearerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("Other", "Person", existingEmail)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectInvalidEmail() throws Exception {
        mockMvc.perform(post("/users")
                        .with(bearerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("Test", "Person", "invalid-email")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectMissingRequiredFields() throws Exception {
        mockMvc.perform(post("/users")
                        .with(bearerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("", "", "")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnNotFoundForMissingUser() throws Exception {
        mockMvc.perform(get("/users/{id}", 999999999L)
                        .with(bearerAuth))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnNotFoundWhenUpdatingMissingUser() throws Exception {
        mockMvc.perform(put("/users/{id}", 999999999L)
                        .with(bearerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("Test", "Person", uniqueEmail())))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingUser() throws Exception {
        mockMvc.perform(delete("/users/{id}", 999999999L)
                        .with(bearerAuth))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectUnauthenticatedListing() throws Exception {
        mockMvc.perform(get("/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedCreation() throws Exception {
        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("Test", "Person", uniqueEmail())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedUpdate() throws Exception {
        JsonNode created = json(createUser(uniqueEmail()));

        mockMvc.perform(put("/users/{id}", created.get("id").asLong())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson("Changed", "Person", uniqueEmail())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedDeletion() throws Exception {
        JsonNode created = json(createUser(uniqueEmail()));

        mockMvc.perform(delete("/users/{id}", created.get("id").asLong()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRegisterWithValidInvitation() throws Exception {
        String email = uniqueEmail();
        JsonNode created = json(createUser(email));
        String invitation = created.get("invitationToken").asText();

        String registration = """
                {"email":"%s","password":"TestPassword123!",
                 "invitationToken":"%s"}
                """.formatted(email, invitation);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registration))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"TestPassword123!"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorization").isNotEmpty());
    }

    @Test
    void shouldRejectInvalidInvitation() throws Exception {
        String email = uniqueEmail();
        createUser(email);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"TestPassword123!",
                                 "invitationToken":"invalid-token"}
                                """.formatted(email)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldResetPasswordInvitation() throws Exception {
        JsonNode created = json(createUser(uniqueEmail()));
        long id = created.get("id").asLong();

        mockMvc.perform(post("/auth/reset-password")
                        .with(bearerAuth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":" + id + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.invitationToken").isNotEmpty());
    }
}
