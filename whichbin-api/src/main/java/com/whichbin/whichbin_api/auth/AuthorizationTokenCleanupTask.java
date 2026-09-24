package com.whichbin.whichbin_api.auth;

import com.whichbin.whichbin_api.repository.AuthorizationTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class AuthorizationTokenCleanupTask {

    private final AuthorizationTokenRepository authorizationTokenRepository;

    public AuthorizationTokenCleanupTask(AuthorizationTokenRepository authorizationTokenRepository) {
        this.authorizationTokenRepository = authorizationTokenRepository;
    }

    @Transactional
    @Scheduled(cron = "${app.auth.token-cleanup-cron}")
    public void deleteExpiredAuthorizationTokens() {
        authorizationTokenRepository.deleteByExpiresAtBefore(Instant.now());
    }
}