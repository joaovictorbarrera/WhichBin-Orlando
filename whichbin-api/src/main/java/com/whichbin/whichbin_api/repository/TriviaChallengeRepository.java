package com.whichbin.whichbin_api.repository;

import com.whichbin.whichbin_api.model.TriviaChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TriviaChallengeRepository
        extends JpaRepository<TriviaChallenge, Long> {

    List<TriviaChallenge> findByActiveTrueOrderByIdAsc();

    Page<TriviaChallenge> findByActiveTrue(Pageable pageable);
}