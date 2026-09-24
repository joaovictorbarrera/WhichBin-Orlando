package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.model.TriviaQuestion;
import com.whichbin.whichbin_api.repository.TriviaQuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TriviaQuestionService {

    private final TriviaQuestionRepository triviaQuestionRepository;

    public TriviaQuestionService(TriviaQuestionRepository triviaQuestionRepository) {
        this.triviaQuestionRepository = triviaQuestionRepository;
    }

    public List<TriviaQuestion> getAllQuestions() {
        return triviaQuestionRepository.findAll();
    }

    public TriviaQuestion createQuestion(TriviaQuestion question) {
        return triviaQuestionRepository.save(question);
    }

    public TriviaQuestion updateQuestion(Long id, TriviaQuestion question) {
        TriviaQuestion existingQuestion = triviaQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trivia question not found"));

        existingQuestion.setQuestion(question.getQuestion());
        existingQuestion.setAnswerA(question.getAnswerA());
        existingQuestion.setAnswerB(question.getAnswerB());
        existingQuestion.setAnswerC(question.getAnswerC());
        existingQuestion.setAnswerD(question.getAnswerD());
        existingQuestion.setCorrectAnswer(question.getCorrectAnswer());

        return triviaQuestionRepository.save(existingQuestion);
    }

    public void deleteQuestion(Long id) {
        triviaQuestionRepository.deleteById(id);
    }
}