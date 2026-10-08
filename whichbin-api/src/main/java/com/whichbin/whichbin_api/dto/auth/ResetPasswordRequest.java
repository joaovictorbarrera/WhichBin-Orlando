package com.whichbin.whichbin_api.dto.auth;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ResetPasswordRequest(
        @NotNull(message = "User ID is required")
        @Positive(message = "User ID must be positive")
        Long userId
) {
}
