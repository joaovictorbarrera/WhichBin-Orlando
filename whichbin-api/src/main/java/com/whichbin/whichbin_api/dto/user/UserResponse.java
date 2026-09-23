package com.whichbin.whichbin_api.dto.user;

import java.time.OffsetDateTime;

public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}