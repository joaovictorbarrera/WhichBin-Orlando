
package com.whichbin.whichbin_api;

import com.whichbin.whichbin_api.model.TriviaChallenge;
import com.whichbin.whichbin_api.model.TriviaQuestion;
import com.whichbin.whichbin_api.repository.TriviaChallengeRepository;
import com.whichbin.whichbin_api.repository.TriviaQuestionRepository;
import com.whichbin.whichbin_api.testutil.IntegrationTestHelper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class TriviaQuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TriviaChallengeRepository challengeRepository;

    @Autowired
    private TriviaQuestionRepository questionRepository;

    @Autowired
    private IntegrationTestHelper testHelper;

    @Test
    void shouldCreateQuestionForExistingChallenge() throws Exception {
        String token = testHelper.getAuthToken();
        TriviaChallenge challenge = saveChallenge();

        mockMvc.perform(post("/resources/trivia/question")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(questionRequest(
                                challenge.getId(),
                                "Which item is recyclable?",
                                "Plastic bottle")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.question")
                        .value("Which item is recyclable?"))
                .andExpect(jsonPath("$.correctAnswer")
                        .value("Plastic bottle"));
    }

    @Test
    void shouldRejectQuestionCreationWithoutAuthentication()
            throws Exception {
        TriviaChallenge challenge = saveChallenge();

        mockMvc.perform(post("/resources/trivia/question")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(questionRequest(
                                challenge.getId(),
                                "Test question",
                                "Plastic bottle")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectQuestionWhenCorrectAnswerDoesNotMatchChoices()
            throws Exception {
        String token = testHelper.getAuthToken();
        TriviaChallenge challenge = saveChallenge();

        mockMvc.perform(post("/resources/trivia/question")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "challengeId": %d,
                                    "question": {
                                        "question": "Which item is recyclable?",
                                        "answerA": "Plastic bottle",
                                        "answerB": "Plastic bag",
                                        "answerC": "Food waste",
                                        "answerD": "Styrofoam cup",
                                        "correctAnswer": "Glass jar"
                                    }
                                }
                                """.formatted(challenge.getId())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnNotFoundWhenChallengeDoesNotExist()
            throws Exception {
        String token = testHelper.getAuthToken();

        mockMvc.perform(post("/resources/trivia/question")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(questionRequest(
                                999999999L,
                                "Test question",
                                "Plastic bottle")))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldUpdateQuestion() throws Exception {
        String token = testHelper.getAuthToken();
        TriviaChallenge challenge = saveChallenge();
        TriviaQuestion question = saveQuestion(challenge);

        mockMvc.perform(put(
                        "/resources/trivia/question/{id}",
                        question.getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "question": "Updated question?",
                                    "answerA": "Glass jar",
                                    "answerB": "Plastic bag",
                                    "answerC": "Food waste",
                                    "answerD": "Styrofoam cup",
                                    "correctAnswer": "Glass jar"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(question.getId()))
                .andExpect(jsonPath("$.question")
                        .value("Updated question?"))
                .andExpect(jsonPath("$.correctAnswer")
                        .value("Glass jar"));
    }

    @Test
    void shouldDeleteQuestion() throws Exception {
        String token = testHelper.getAuthToken();
        TriviaChallenge challenge = saveChallenge();
        TriviaQuestion question = saveQuestion(challenge);

        mockMvc.perform(delete(
                        "/resources/trivia/question/{id}",
                        question.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        assertFalse(questionRepository.existsById(question.getId()));
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingQuestion()
            throws Exception {
        String token = testHelper.getAuthToken();

        mockMvc.perform(delete(
                        "/resources/trivia/question/{id}",
                        999999999L)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    private TriviaChallenge saveChallenge() {
        return challengeRepository.saveAndFlush(
                new TriviaChallenge(
                        "Question Test Challenge",
                        "Challenge used for question tests."
                )
        );
    }

    private TriviaQuestion saveQuestion(TriviaChallenge challenge) {
        TriviaQuestion question = new TriviaQuestion(
                "Original question?",
                "Plastic bottle",
                "Plastic bag",
                "Food waste",
                "Styrofoam cup",
                "Plastic bottle"
        );

        question.setChallenge(challenge);

        return questionRepository.saveAndFlush(question);
    }

    private String questionRequest(
            Long challengeId,
            String question,
            String correctAnswer) {

        return """
                {
                    "challengeId": %d,
                    "question": {
                        "question": "%s",
                        "answerA": "Plastic bottle",
                        "answerB": "Plastic bag",
                        "answerC": "Food waste",
                        "answerD": "Styrofoam cup",
                        "correctAnswer": "%s"
                    }
                }
                """.formatted(challengeId, question, correctAnswer);
    }
}
