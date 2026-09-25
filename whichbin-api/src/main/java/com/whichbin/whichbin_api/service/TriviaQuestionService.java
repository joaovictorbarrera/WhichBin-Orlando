package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.model.TriviaQuestion;
import com.whichbin.whichbin_api.repository.TriviaQuestionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
        validateCorrectAnswer(question);
        return triviaQuestionRepository.save(question);
    }

    public TriviaQuestion updateQuestion(Long id, TriviaQuestion question) {
        TriviaQuestion existingQuestion = triviaQuestionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Question does not exist"
                ));

        validateCorrectAnswer(question);

        existingQuestion.setQuestion(question.getQuestion());
        existingQuestion.setAnswerA(question.getAnswerA());
        existingQuestion.setAnswerB(question.getAnswerB());
        existingQuestion.setAnswerC(question.getAnswerC());
        existingQuestion.setAnswerD(question.getAnswerD());
        existingQuestion.setCorrectAnswer(question.getCorrectAnswer());

        return triviaQuestionRepository.save(existingQuestion);
    }

    public void deleteQuestion(Long id) {
        if (!triviaQuestionRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Question does not exist"
            );
        }

        triviaQuestionRepository.deleteById(id);
    }

    private void validateCorrectAnswer(TriviaQuestion question) {
        String correctAnswer = question.getCorrectAnswer();

        if (!correctAnswer.equals(question.getAnswerA())
                && !correctAnswer.equals(question.getAnswerB())
                && !correctAnswer.equals(question.getAnswerC())
                && !correctAnswer.equals(question.getAnswerD())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Correct answer must match one of the answer choices"
            );
        }
    }
}