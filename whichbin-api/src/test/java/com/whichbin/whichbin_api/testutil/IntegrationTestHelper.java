
package com.whichbin.whichbin_api.testutil;

import com.whichbin.whichbin_api.dto.user.CreateUserRequest;
import com.whichbin.whichbin_api.dto.user.UserResponse;
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

    private String token;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorizationTokenService authorizationTokenService;

    @Autowired
    private PlatformTransactionManager transactionManager;

    public synchronized String getAuthToken() {
        if (token != null) {
            return token;
        }

        TransactionTemplate transactionTemplate =
                new TransactionTemplate(transactionManager);

        transactionTemplate.setPropagationBehavior(
                TransactionDefinition.PROPAGATION_REQUIRES_NEW
        );

        token = transactionTemplate.execute(status -> {
            UserResponse userResponse = userService.createUser(
                    new CreateUserRequest(
                            "Integration",
                            "Test",
                            "integration-test@example.com",
                            "test-PASSWORD-123"
                    )
            );

            User user = userRepository.findById(userResponse.id())
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "Integration test user was not found"
                            )
                    );

            return authorizationTokenService.createAuthorizationToken(user);
        });

        if (token == null || token.isBlank()) {
            throw new IllegalStateException(
                    "Failed to create integration test authorization token"
            );
        }

        return token;
    }
}
