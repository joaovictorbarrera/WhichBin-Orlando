package com.whichbin.whichbin_api.controller;

import com.whichbin.whichbin_api.auth.Authenticated;
import com.whichbin.whichbin_api.service.AuthorizationTokenService;
import com.whichbin.whichbin_api.auth.CurrentUser;
import com.whichbin.whichbin_api.dto.auth.LoginRequest;
import com.whichbin.whichbin_api.dto.auth.LoginResponse;
import com.whichbin.whichbin_api.dto.auth.MeResponse;
import com.whichbin.whichbin_api.model.User;
import com.whichbin.whichbin_api.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final AuthorizationTokenService authorizationTokenService;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthorizationTokenService authorizationTokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authorizationTokenService = authorizationTokenService;
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

        String authorizationToken = authorizationTokenService.createAuthorizationToken(user);

        return new LoginResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                authorizationToken
        );
    }

    @Authenticated
    @GetMapping("/me")
    public MeResponse me(@CurrentUser User user) {
        return new MeResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail()
        );
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader
    ) {
        authorizationTokenService.revokeAuthorizationHeader(authorizationHeader);
    }
}