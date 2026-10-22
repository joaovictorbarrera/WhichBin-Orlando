package com.whichbin.whichbin_api.service;

import com.whichbin.whichbin_api.dto.user.CreateUserRequest;
import com.whichbin.whichbin_api.dto.user.CreateUserResponse;
import com.whichbin.whichbin_api.dto.user.UpdateUserRequest;
import com.whichbin.whichbin_api.dto.user.UserResponse;
import com.whichbin.whichbin_api.dto.auth.RegisterRequest;
import com.whichbin.whichbin_api.model.User;
import com.whichbin.whichbin_api.repository.AuthorizationTokenRepository;
import com.whichbin.whichbin_api.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

@Service
public class UserService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int INVITATION_TOKEN_BYTE_LENGTH = 32;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthorizationTokenRepository authorizationTokenRepository;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthorizationTokenRepository authorizationTokenRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authorizationTokenRepository = authorizationTokenRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll(
                        Sort.by(
                                Sort.Order.asc("lastName"),
                                Sort.Order.asc("firstName"),
                                Sort.Order.asc("id")
                        )
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = findUserOrThrow(id);
        return toResponse(user);
    }

    @Transactional
    public CreateUserResponse createUser(CreateUserRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email already in use"
            );
        }

        User user = new User(
                normalizeText(request.firstName()),
                normalizeText(request.lastName()),
                normalizedEmail,
                generateInvitationToken()
        );

        User savedUser = userRepository.save(user);
        return new CreateUserResponse(
                savedUser.getId(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getEmail(),
                savedUser.getCreatedAt(),
                savedUser.getUpdatedAt(),
                savedUser.getInvitationToken()
        );
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = findUserOrThrow(id);
        String normalizedEmail = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCaseAndIdNot(normalizedEmail, id)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email already in use"
            );
        }

        user.setFirstName(normalizeText(request.firstName()));
        user.setLastName(normalizeText(request.lastName()));
        user.setEmail(normalizedEmail);

        return toResponse(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = findUserOrThrow(id);
        authorizationTokenRepository.deleteAllByUserId(user.getId());
        userRepository.delete(user);
    }

    @Transactional
    public String createPasswordResetInvitation(Long id) {
        User user = userRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        String invitationToken = generateInvitationToken();

        user.setInvitationToken(invitationToken);
        user.setPasswordHash(null);
        authorizationTokenRepository.deleteAllByUserId(user.getId());

        return invitationToken;
    }

    @Transactional
    public void register(RegisterRequest request) {
        User user = userRepository.findByEmailIgnoreCaseForUpdate(normalizeEmail(request.email()))
                .orElseThrow(() -> invalidInvitation());

        String storedInvitationToken = user.getInvitationToken();
        if (storedInvitationToken == null
                || !MessageDigest.isEqual(
                        storedInvitationToken.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                        request.invitationToken().getBytes(java.nio.charset.StandardCharsets.UTF_8)
                )) {
            throw invalidInvitation();
        }

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setInvitationToken(null);
        authorizationTokenRepository.deleteAllByUserId(user.getId());
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String normalizeText(String value) {
        return value.trim();
    }

    private String generateInvitationToken() {
        byte[] bytes = new byte[INVITATION_TOKEN_BYTE_LENGTH];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private ResponseStatusException invalidInvitation() {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invitation token is invalid or has already been used"
        );
    }
}