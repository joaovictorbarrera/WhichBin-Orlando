package com.whichbin.whichbin_api.testutil;

import com.whichbin.whichbin_api.dto.user.CreateUserRequest;
import com.whichbin.whichbin_api.dto.user.CreateUserResponse;
import com.whichbin.whichbin_api.model.User;
import com.whichbin.whichbin_api.repository.UserRepository;
import com.whichbin.whichbin_api.service.AuthorizationTokenService;
import com.whichbin.whichbin_api.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class IntegrationTestHelper {

    private static final String TEST_USER_EMAIL =
            "integration-test@example.com";

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorizationTokenService authorizationTokenService;

    @Autowired
    private PlatformTransactionManager transactionManager;

    public String getAuthToken() {
        TransactionTemplate transactionTemplate =
                new TransactionTemplate(transactionManager);

        transactionTemplate.setPropagationBehavior(
                TransactionDefinition.PROPAGATION_REQUIRES_NEW
        );

        String token = transactionTemplate.execute(status -> {
            User user = userRepository
                    .findByEmailIgnoreCase(TEST_USER_EMAIL)
                    .orElseGet(this::createTestUser);
            return authorizationTokenService.createAuthorizationToken(user);
        });

        if (token == null || token.isBlank()) {
            throw new IllegalStateException(
                    "Failed to create integration test authorization token"
            );
        }

        return token;
    }

    private User createTestUser() {
        CreateUserResponse userResponse = userService.createUser(
                new CreateUserRequest(
                        "Integration",
                        "Test",
                        TEST_USER_EMAIL
                )
        );

        return userRepository.findById(userResponse.id())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Integration test user was not found"
                        )
                );
    }
}
