package com.whichbin.whichbin_api.repository;

import com.whichbin.whichbin_api.model.TriviaChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TriviaChallengeRepository extends JpaRepository<TriviaChallenge, Long> {
}