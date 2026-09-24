package com.whichbin.whichbin_api.auth;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

@Service
public class AuthorizationTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public String generateAuthorizationToken() {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);

        return HexFormat.of().formatHex(randomBytes);
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