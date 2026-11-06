
package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.model.TriviaChallenge;
import com.whichbin.whichbin_api.repository.TriviaChallengeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TriviaChallengeService {

    private final TriviaChallengeRepository triviaChallengeRepository;

    public TriviaChallengeService(
            TriviaChallengeRepository triviaChallengeRepository) {
        this.triviaChallengeRepository = triviaChallengeRepository;
    }

    // Returns active challenges only.
    public List<TriviaChallenge> getActiveChallenges() {
        return triviaChallengeRepository.findByActiveTrueOrderByIdAsc();
    }

    // Returns active challenges only, with pagination.
    public Page<TriviaChallenge> getActiveChallenges(Pageable pageable) {
        return triviaChallengeRepository.findByActiveTrue(pageable);
    }

    // Returns all challenges, including inactive ones.
    public List<TriviaChallenge> getAllChallenges() {
        return triviaChallengeRepository.findAll();
    }

    // Returns all challenges with pagination.
    public Page<TriviaChallenge> getAllChallenges(Pageable pageable) {
        return triviaChallengeRepository.findAll(pageable);
    }

    // Returns one challenge only if it is active.
    public TriviaChallenge getActiveChallengeById(Long id) {
        TriviaChallenge challenge = triviaChallengeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Challenge does not exist"
                ));

        if (!challenge.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Challenge is inactive"
            );
        }

        return challenge;
    }

    // Creates a new challenge.
    public TriviaChallenge createChallenge(TriviaChallenge challenge) {
        challenge.setActive(false);
        return triviaChallengeRepository.save(challenge);
    }

    // Updates an existing challenge.
    public TriviaChallenge updateChallenge(
            Long id,
            TriviaChallenge challenge) {

        TriviaChallenge existingChallenge =
                triviaChallengeRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Challenge does not exist"
                        ));

        existingChallenge.setTitle(challenge.getTitle());
        existingChallenge.setDescription(challenge.getDescription());
        existingChallenge.setActive(challenge.isActive());

        return triviaChallengeRepository.save(existingChallenge);
    }

    // Deletes an existing challenge.
    public void deleteChallenge(Long id) {
        if (!triviaChallengeRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Challenge does not exist"
            );
        }

        triviaChallengeRepository.deleteById(id);
    }
}
