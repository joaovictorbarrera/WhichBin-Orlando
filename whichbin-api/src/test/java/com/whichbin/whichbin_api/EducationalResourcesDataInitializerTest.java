
package com.whichbin.whichbin_api;

import com.whichbin.whichbin_api.model.Resource;
import com.whichbin.whichbin_api.model.TriviaChallenge;
import com.whichbin.whichbin_api.model.TriviaQuestion;
import com.whichbin.whichbin_api.repository.ResourceRepository;
import com.whichbin.whichbin_api.repository.TriviaChallengeRepository;
import com.whichbin.whichbin_api.repository.TriviaQuestionRepository;
import com.whichbin.whichbin_api.service.ResourceDataInitializer;
import com.whichbin.whichbin_api.service.TriviaQuestionDataInitializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EducationalResourcesDataInitializerTest {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private TriviaChallengeRepository challengeRepository;

    @Autowired
    private TriviaQuestionRepository questionRepository;

    @Autowired
    private ResourceDataInitializer resourceDataInitializer;

    @Autowired
    private TriviaQuestionDataInitializer triviaQuestionDataInitializer;

    @Test
    void shouldSeedAllFourEducationalResources() {
        assertTrue(
                resourceRepository.findByTitle("Recycling Basics").isPresent()
        );

        assertTrue(
                resourceRepository.findByTitle("How to Prepare Items").isPresent()
        );

        assertTrue(
                resourceRepository.findByTitle("Common Mistakes").isPresent()
        );

        assertTrue(
                resourceRepository.findByTitle("Orlando Recycling Guide").isPresent()
        );
    }

    @Test
    void shouldSeedUsefulResourceContentAndSections() {
        Resource resource = resourceRepository
                .findByTitle("Recycling Basics")
                .orElseThrow();

        assertNotNull(resource.getDescription());
        assertFalse(resource.getDescription().isBlank());

        assertNotNull(resource.getContent());
        assertFalse(resource.getContent().isBlank());

        assertNotNull(resource.getPdfUrl());
        assertTrue(resource.getPdfUrl().endsWith(".pdf"));

        assertNotNull(resource.getSections());
        assertEquals(4, resource.getSections().size());

        assertEquals(
                "What Can Be Recycled?",
                resource.getSections().get(0).getHeading()
        );
    }

    @Test
    void shouldSeedTriviaChallengeAndFiveQuestions() {
        TriviaChallenge challenge = challengeRepository.findAll()
                .stream()
                .filter(item -> item.getTitle()
                        .equals("Recycling Basics Challenge"))
                .findFirst()
                .orElseThrow();

        assertFalse(challenge.isActive());

        List<TriviaQuestion> questions =
                questionRepository.findByChallengeId(challenge.getId());

        assertEquals(5, questions.size());

        for (TriviaQuestion question : questions) {
            assertNotNull(question.getQuestion());
            assertFalse(question.getQuestion().isBlank());

            assertTrue(
                    question.getCorrectAnswer().equals(question.getAnswerA())
                            || question.getCorrectAnswer().equals(question.getAnswerB())
                            || question.getCorrectAnswer().equals(question.getAnswerC())
                            || question.getCorrectAnswer().equals(question.getAnswerD())
            );
        }
    }

    @Test
    void shouldNotDuplicateSeedDataWhenInitializersRunAgain() {
        int resourceCountBefore = resourceRepository.findAll().size();
        int challengeCountBefore = challengeRepository.findAll().size();
        int questionCountBefore = questionRepository.findAll().size();

        resourceDataInitializer.run();
        triviaQuestionDataInitializer.run();

        assertEquals(
                resourceCountBefore,
                resourceRepository.findAll().size()
        );

        assertEquals(
                challengeCountBefore,
                challengeRepository.findAll().size()
        );

        assertEquals(
                questionCountBefore,
                questionRepository.findAll().size()
        );
    }
}
