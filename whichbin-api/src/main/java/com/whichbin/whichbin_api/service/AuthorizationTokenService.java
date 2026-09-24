package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.model.AuthorizationToken;
import com.whichbin.whichbin_api.config.AuthorizationTokenConfig;
import com.whichbin.whichbin_api.model.User;
import com.whichbin.whichbin_api.repository.AuthorizationTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class AuthorizationTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int TOKEN_BYTE_LENGTH = 32;
    private static final String BEARER_PREFIX = "Bearer ";

    private final AuthorizationTokenRepository authorizationTokenRepository;
    private final AuthorizationTokenConfig authorizationTokenProperties;

    public AuthorizationTokenService(
            AuthorizationTokenRepository authorizationTokenRepository,
            AuthorizationTokenConfig authorizationTokenProperties
    ) {
        this.authorizationTokenRepository = authorizationTokenRepository;
        this.authorizationTokenProperties = authorizationTokenProperties;
    }

    @Transactional
    public String createAuthorizationToken(User user) {
        String authorizationToken = generateAuthorizationToken();
        String authorizationHash = hashAuthorizationToken(authorizationToken);

        Instant now = Instant.now();
        Instant expiresAt = now.plus(authorizationTokenProperties.getTokenTtl());

        AuthorizationToken token = new AuthorizationToken(
                authorizationHash,
                user,
                now,
                expiresAt
        );

        authorizationTokenRepository.save(token);

        return authorizationToken;
    }

    @Transactional
    public Optional<User> findUserByAuthorizationToken(String authorizationToken) {
        String authorizationHash = hashAuthorizationToken(authorizationToken);
        Instant now = Instant.now();

        Optional<AuthorizationToken> tokenOptional = authorizationTokenRepository.findByAuthorizationHash(authorizationHash);

        if (tokenOptional.isEmpty()) {
            return Optional.empty();
        }

        AuthorizationToken token = tokenOptional.get();

        if (token.isExpired(now)) {
            authorizationTokenRepository.delete(token);
            return Optional.empty();
        }

        if (token.isPastHalfLife(now)) {
            token.setExpiresAt(now.plus(authorizationTokenProperties.getTokenTtl()));
            authorizationTokenRepository.save(token);
        }

        return Optional.of(token.getUser());
    }

    @Transactional
    public void revokeAuthorizationToken(String authorizationToken) {
        String authorizationHash = hashAuthorizationToken(authorizationToken);
        authorizationTokenRepository.deleteByAuthorizationHash(authorizationHash);
    }

    @Transactional
    public void revokeAuthorizationHeader(String authorizationHeader) {
        extractBearerToken(authorizationHeader)
                .ifPresent(this::revokeAuthorizationToken);
    }

    public Optional<String> extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return Optional.empty();
        }

        if (!authorizationHeader.startsWith(BEARER_PREFIX)) {
            return Optional.empty();
        }

        String token = authorizationHeader.substring(BEARER_PREFIX.length()).trim();

        if (token.isBlank()) {
            return Optional.empty();
        }

        return Optional.of(token);
    }

    public String generateAuthorizationToken() {
        byte[] bytes = new byte[TOKEN_BYTE_LENGTH];
        SECURE_RANDOM.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    public String hashAuthorizationToken(String authorizationToken) {
        try {
            byte[] hash = MessageDigest
                    .getInstance("SHA-256")
                    .digest(authorizationToken.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 algorithm is not available", exception);
        }
    }
}