package com.whichbin.whichbin_api.controller;

import com.whichbin.whichbin_api.auth.Authenticated;
import com.whichbin.whichbin_api.model.Resource;
import com.whichbin.whichbin_api.model.TriviaChallenge;
import com.whichbin.whichbin_api.model.TriviaQuestion;
import com.whichbin.whichbin_api.service.ResourceService;
import com.whichbin.whichbin_api.service.TriviaChallengeService;
import com.whichbin.whichbin_api.service.TriviaQuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/resources")
public class ResourceController {

    private final ResourceService resourceService;
    private final TriviaQuestionService triviaQuestionService;
    private final TriviaChallengeService triviaChallengeService;

    public ResourceController(
            ResourceService resourceService,
            TriviaQuestionService triviaQuestionService,
            TriviaChallengeService triviaChallengeService) {

        this.resourceService = resourceService;
        this.triviaQuestionService = triviaQuestionService;
        this.triviaChallengeService = triviaChallengeService;
    }

    @GetMapping
    public List<Resource> getAllResources() {
        return resourceService.getAllResources();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(
            @PathVariable Long id) {

        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Authenticated
    @PostMapping
    public Resource createResource(@RequestBody Resource resource) {
        return resourceService.createResource(resource);
    }

    @Authenticated
    @PutMapping("/{id}")
    public Resource updateResource(
            @PathVariable Long id,
            @RequestBody Resource resource) {

        return resourceService.updateResource(id, resource);
    }

    @Authenticated
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long id) {

        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    // Public route: active challenges only.
    @GetMapping("/trivia/challenges")
    public List<TriviaChallenge> getActiveTriviaChallenges() {
        return triviaChallengeService.getActiveChallenges();
    }

    // Admin route: all challenges, including inactive ones.
    @Authenticated
    @GetMapping("/trivia/challenges/all")
    public List<TriviaChallenge> getAllTriviaChallenges() {
        return triviaChallengeService.getAllChallenges();
    }

    // Public route: inactive challenges cannot be opened by direct URL.
    @GetMapping("/trivia/challenges/{id}")
    public ResponseEntity<TriviaChallenge> getTriviaChallengeById(
            @PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                    triviaChallengeService.getActiveChallengeById(id)
            );
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().value() == 404) {
                return ResponseEntity.notFound().build();
            }

            throw exception;
        }
    }

    @Authenticated
    @PostMapping("/trivia/challenges")
    public TriviaChallenge createTriviaChallenge(
            @RequestBody TriviaChallenge challenge) {

        return triviaChallengeService.createChallenge(challenge);
    }

    @Authenticated
    @PutMapping("/trivia/challenges/{id}")
    public TriviaChallenge updateTriviaChallenge(
            @PathVariable Long id,
            @RequestBody TriviaChallenge challenge) {

        return triviaChallengeService.updateChallenge(id, challenge);
    }

    @Authenticated
    @DeleteMapping("/trivia/challenges/{id}")
    public ResponseEntity<Void> deleteTriviaChallenge(
            @PathVariable Long id) {

        triviaChallengeService.deleteChallenge(id);
        return ResponseEntity.noContent().build();
    }

    // Trivia question routes are grouped under /question.
    @Authenticated
    @PostMapping("/trivia/question/challenges/{challengeId}")
    public TriviaQuestion createTriviaQuestionForChallenge(
            @PathVariable Long challengeId,
            @RequestBody TriviaQuestion question) {

        return triviaQuestionService.createQuestion(
                challengeId,
                question
        );
    }

    @Authenticated
    @PutMapping("/trivia/question/{id}")
    public TriviaQuestion updateTriviaQuestion(
            @PathVariable Long id,
            @RequestBody TriviaQuestion question) {

        return triviaQuestionService.updateQuestion(id, question);
    }

    @Authenticated
    @DeleteMapping("/trivia/question/{id}")
    public ResponseEntity<Void> deleteTriviaQuestion(
            @PathVariable Long id) {

        triviaQuestionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}