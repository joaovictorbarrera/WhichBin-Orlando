package com.whichbin.whichbin_api.controller;

import com.whichbin.whichbin_api.model.TriviaQuestion;
import com.whichbin.whichbin_api.service.TriviaQuestionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trivia")
public class TriviaQuestionController {

    private final TriviaQuestionService triviaQuestionService;

    public TriviaQuestionController(TriviaQuestionService triviaQuestionService) {
        this.triviaQuestionService = triviaQuestionService;
    }

    @GetMapping
    public List<TriviaQuestion> getAllQuestions() {
        return triviaQuestionService.getAllQuestions();
    }

    @PostMapping
    public TriviaQuestion createQuestion(@RequestBody TriviaQuestion question) {
        return triviaQuestionService.createQuestion(question);
    }

    @PutMapping("/{id}")
    public TriviaQuestion updateQuestion(
            @PathVariable Long id,
            @RequestBody TriviaQuestion question) {
        return triviaQuestionService.updateQuestion(id, question);
    }

    @DeleteMapping("/{id}")
    public void deleteQuestion(@PathVariable Long id) {
        triviaQuestionService.deleteQuestion(id);
    }
}