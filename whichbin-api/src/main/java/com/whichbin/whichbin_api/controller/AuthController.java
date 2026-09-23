package com.whichbin.whichbin_api.controller;

import com.whichbin.whichbin_api.dto.auth.LoginRequest;
import com.whichbin.whichbin_api.dto.auth.LoginResponse;
import com.whichbin.whichbin_api.model.User;
import com.whichbin.whichbin_api.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        String authorization = generateAuthorizationToken();
        String authorizationHash = sha256Hex(authorization);

        user.setAuthorizationHash(authorizationHash);
        User savedUser = userRepository.save(user);

        return new LoginResponse(
                savedUser.getId(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getEmail(),
                authorization
        );
    }

    private static String generateAuthorizationToken() {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);

        return sha256Hex(HexFormat.of().formatHex(randomBytes));
    }

    private static String sha256Hex(String value) {
        try {
            byte[] hash = MessageDigest
                    .getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 algorithm is not available", exception);
        }
    }
}