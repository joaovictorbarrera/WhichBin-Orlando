package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.model.TriviaChallenge;
import com.whichbin.whichbin_api.repository.TriviaChallengeRepository;
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

    // Public listing: return active challenges only.
    public List<TriviaChallenge> getActiveChallenges() {
        return triviaChallengeRepository.findByActiveTrueOrderByIdAsc();
    }

    // Admin listing: return active and inactive challenges.
    public List<TriviaChallenge> getAllChallenges() {
        return triviaChallengeRepository.findAll();
    }

    // Public detail: inactive challenges cannot be opened directly.
    public TriviaChallenge getActiveChallengeById(Long id) {
        return triviaChallengeRepository.findById(id)
                .filter(TriviaChallenge::isActive)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Active challenge does not exist"
                ));
    }

    // New challenges must always start inactive.
    public TriviaChallenge createChallenge(TriviaChallenge challenge) {
        challenge.setActive(false);
        return triviaChallengeRepository.save(challenge);
    }

    // The active status can be changed when editing a challenge.
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