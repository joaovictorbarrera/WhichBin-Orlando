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

    public TriviaChallengeService(TriviaChallengeRepository triviaChallengeRepository) {
        this.triviaChallengeRepository = triviaChallengeRepository;
    }

    public List<TriviaChallenge> getAllChallenges() {
        return triviaChallengeRepository.findAll();
    }

    public TriviaChallenge getChallengeById(Long id) {
        return triviaChallengeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Challenge does not exist"
                ));
    }

    public TriviaChallenge createChallenge(TriviaChallenge challenge) {
        return triviaChallengeRepository.save(challenge);
    }

    public TriviaChallenge updateChallenge(Long id, TriviaChallenge challenge) {

        TriviaChallenge existingChallenge = triviaChallengeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Challenge does not exist"
                ));

        existingChallenge.setTitle(challenge.getTitle());
        existingChallenge.setDescription(challenge.getDescription());

        return triviaChallengeRepository.save(existingChallenge);
    }

    public void deleteChallenge(Long id) {

        if (!triviaChallengeRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Challenge does not exist"
            );
        }

        triviaChallengeRepository.deleteById(id);
    }
}