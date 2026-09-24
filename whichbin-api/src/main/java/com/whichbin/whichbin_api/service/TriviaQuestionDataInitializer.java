package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.model.TriviaQuestion;
import com.whichbin.whichbin_api.repository.TriviaQuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TriviaQuestionDataInitializer implements CommandLineRunner {

    private final TriviaQuestionRepository triviaQuestionRepository;

    public TriviaQuestionDataInitializer(
            TriviaQuestionRepository triviaQuestionRepository) {
        this.triviaQuestionRepository = triviaQuestionRepository;
    }

    @Override
    public void run(String... args) {
        seedQuestions();
    }

    private void seedQuestions() {

        if (triviaQuestionRepository.findAll().isEmpty()) {

            triviaQuestionRepository.save(
                    new TriviaQuestion(
                            "Which of these items belongs in the recycling cart?",
                            "Plastic bottle",
                            "Plastic bag",
                            "Styrofoam cup",
                            "Food waste",
                            "Plastic bottle"
                    )
            );

            triviaQuestionRepository.save(
                    new TriviaQuestion(
                            "What should you do with a plastic container before recycling it?",
                            "Put it inside a plastic bag",
                            "Empty it and rinse it",
                            "Fill it with water",
                            "Throw it away",
                            "Empty it and rinse it"
                    )
            );

            triviaQuestionRepository.save(
                    new TriviaQuestion(
                            "How should cardboard boxes be prepared for recycling?",
                            "Leave them full of packing material",
                            "Put them inside a plastic bag",
                            "Flatten them",
                            "Soak them in water",
                            "Flatten them"
                    )
            );

            triviaQuestionRepository.save(
                    new TriviaQuestion(
                            "Which item should NOT go into the recycling cart?",
                            "Glass bottle",
                            "Aluminum can",
                            "Plastic bag",
                            "Paper",
                            "Plastic bag"
                    )
            );

            triviaQuestionRepository.save(
                    new TriviaQuestion(
                            "How should recyclable items be placed in the recycling cart?",
                            "Inside plastic bags",
                            "Loose",
                            "Inside cardboard boxes",
                            "Inside trash bags",
                            "Loose"
                    )
            );
        }
    }
}