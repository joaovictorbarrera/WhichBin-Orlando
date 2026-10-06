package com.whichbin.whichbin_api.repository;

import com.whichbin.whichbin_api.model.TriviaQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TriviaQuestionRepository extends JpaRepository<TriviaQuestion, Long> {

    List<TriviaQuestion> findByChallengeId(Long challengeId);
}