package com.whichbin.whichbin_api.controller;

import com.whichbin.whichbin_api.model.Resource;
import com.whichbin.whichbin_api.model.TriviaQuestion;
import com.whichbin.whichbin_api.service.ResourceService;
import com.whichbin.whichbin_api.service.TriviaQuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resources")
public class ResourceController {

    private final ResourceService resourceService;
    private final TriviaQuestionService triviaQuestionService;

    public ResourceController(
            ResourceService resourceService,
            TriviaQuestionService triviaQuestionService) {
        this.resourceService = resourceService;
        this.triviaQuestionService = triviaQuestionService;
    }

    @GetMapping
    public List<Resource> getAllResources() {
        return resourceService.getAllResources();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Resource createResource(@RequestBody Resource resource) {
        return resourceService.createResource(resource);
    }

    @PutMapping("/{id}")
    public Resource updateResource(
            @PathVariable Long id,
            @RequestBody Resource resource) {
        return resourceService.updateResource(id, resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/trivia")
    public List<TriviaQuestion> getAllTriviaQuestions() {
        return triviaQuestionService.getAllQuestions();
    }

    @PostMapping("/trivia")
    public TriviaQuestion createTriviaQuestion(
            @RequestBody TriviaQuestion question) {
        return triviaQuestionService.createQuestion(question);
    }

    @PutMapping("/trivia/{id}")
    public TriviaQuestion updateTriviaQuestion(
            @PathVariable Long id,
            @RequestBody TriviaQuestion question) {
        return triviaQuestionService.updateQuestion(id, question);
    }

    @DeleteMapping("/trivia/{id}")
    public ResponseEntity<Void> deleteTriviaQuestion(@PathVariable Long id) {
        triviaQuestionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}