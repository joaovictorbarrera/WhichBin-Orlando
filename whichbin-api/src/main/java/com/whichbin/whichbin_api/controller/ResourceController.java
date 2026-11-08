
package com.whichbin.whichbin_api.controller;

import com.whichbin.whichbin_api.auth.Authenticated;
import com.whichbin.whichbin_api.dto.CreateQuestionRequest;
import com.whichbin.whichbin_api.dto.PaginatedResponse;
import com.whichbin.whichbin_api.model.Resource;
import com.whichbin.whichbin_api.model.TriviaChallenge;
import com.whichbin.whichbin_api.model.TriviaQuestion;
import com.whichbin.whichbin_api.service.ResourceService;
import com.whichbin.whichbin_api.service.TriviaChallengeService;
import com.whichbin.whichbin_api.service.TriviaQuestionService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    // Returns educational resources with pagination.
    @GetMapping
    public PaginatedResponse<Resource> getAllResources(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {

        if (page < 1 || pageSize < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page and pageSize must be greater than zero"
            );
        }

        Pageable pageable = PageRequest.of(
                page - 1,
                pageSize,
                Sort.by(Sort.Direction.ASC, "id")
        );

        Page<Resource> resourcePage =
                resourceService.getAllResources(pageable);

        return new PaginatedResponse<>(
                resourcePage.getNumber() + 1,
                resourcePage.getTotalPages(),
                resourcePage.getSize(),
                resourcePage.getTotalElements(),
                resourcePage.getContent()
        );
    }

    // Returns one educational resource.
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(
            @PathVariable Long id) {

        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Creates an educational resource.
    @Authenticated
    @PostMapping
    public Resource createResource(@RequestBody Resource resource) {
        return resourceService.createResource(resource);
    }

    // Updates an educational resource.
    @Authenticated
    @PutMapping("/{id}")
    public Resource updateResource(
            @PathVariable Long id,
            @RequestBody Resource resource) {

        return resourceService.updateResource(id, resource);
    }

    // Deletes an educational resource.
    @Authenticated
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long id) {

        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    // Public route: returns active trivia challenges with pagination.
    @GetMapping("/trivia/challenges")
    public PaginatedResponse<TriviaChallenge> getActiveTriviaChallenges(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int pageSize) {

        if (page < 1 || pageSize < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page and pageSize must be greater than zero"
            );
        }

        Pageable pageable = PageRequest.of(
                page - 1,
                pageSize,
                Sort.by(Sort.Direction.ASC, "id")
        );

        Page<TriviaChallenge> challengePage =
                triviaChallengeService.getActiveChallenges(pageable);

        return new PaginatedResponse<>(
                challengePage.getNumber() + 1,
                challengePage.getTotalPages(),
                challengePage.getSize(),
                challengePage.getTotalElements(),
                challengePage.getContent()
        );
    }

    // Admin route: returns active and inactive challenges with pagination.
    @Authenticated
    @GetMapping("/trivia/challenges/all")
    public PaginatedResponse<TriviaChallenge> getAllTriviaChallenges(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {

        if (page < 1 || pageSize < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page and pageSize must be greater than zero"
            );
        }

        Pageable pageable = PageRequest.of(
                page - 1,
                pageSize,
                Sort.by(Sort.Direction.ASC, "id")
        );

        Page<TriviaChallenge> challengePage =
                triviaChallengeService.getAllChallenges(pageable);

        return new PaginatedResponse<>(
                challengePage.getNumber() + 1,
                challengePage.getTotalPages(),
                challengePage.getSize(),
                challengePage.getTotalElements(),
                challengePage.getContent()
        );
    }

    // Public route: inactive challenges cannot be opened directly.
    @GetMapping("/trivia/challenges/{id}")
    public ResponseEntity<TriviaChallenge> getTriviaChallengeById(
            @PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                    triviaChallengeService.getActiveChallengeById(id)
            );
        } catch (ResponseStatusException exception) {

            if (exception.getStatusCode().value()
                    == HttpStatus.NOT_FOUND.value()) {
                return ResponseEntity.notFound().build();
            }

            if (exception.getStatusCode().value()
                    == HttpStatus.UNAUTHORIZED.value()) {
                return ResponseEntity.status(
                        HttpStatus.UNAUTHORIZED
                ).build();
            }

            throw exception;
        }
    }

    // Creates a trivia challenge.
    @Authenticated
    @PostMapping("/trivia/challenges")
    public TriviaChallenge createTriviaChallenge(
            @RequestBody TriviaChallenge challenge) {

        return triviaChallengeService.createChallenge(challenge);
    }

    // Updates a trivia challenge.
    @Authenticated
    @PutMapping("/trivia/challenges/{id}")
    public TriviaChallenge updateTriviaChallenge(
            @PathVariable Long id,
            @RequestBody TriviaChallenge challenge) {

        return triviaChallengeService.updateChallenge(id, challenge);
    }

    // Deletes a trivia challenge.
    @Authenticated
    @DeleteMapping("/trivia/challenges/{id}")
    public ResponseEntity<Void> deleteTriviaChallenge(
            @PathVariable Long id) {

        triviaChallengeService.deleteChallenge(id);
        return ResponseEntity.noContent().build();
    }

    // Creates a trivia question.
    @Authenticated
    @PostMapping("/trivia/question")
    public TriviaQuestion createTriviaQuestion(
            @RequestBody CreateQuestionRequest request) {

        if (request == null
                || request.getChallengeId() == null
                || request.getQuestion() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Challenge ID and question are required"
            );
        }

        return triviaQuestionService.createQuestion(
                request.getChallengeId(),
                request.getQuestion()
        );
    }

    // Updates a trivia question.
    @Authenticated
    @PutMapping("/trivia/question/{id}")
    public TriviaQuestion updateTriviaQuestion(
            @PathVariable Long id,
            @RequestBody TriviaQuestion question) {

        return triviaQuestionService.updateQuestion(id, question);
    }

    // Deletes a trivia question.
    @Authenticated
    @DeleteMapping("/trivia/question/{id}")
    public ResponseEntity<Void> deleteTriviaQuestion(
            @PathVariable Long id) {

        triviaQuestionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
