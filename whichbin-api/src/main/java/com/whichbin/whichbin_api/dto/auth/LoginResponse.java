package com.whichbin.whichbin_api.dto.auth;

public record LoginResponse(
        Long id,
        String firstName,
        String lastName,
        String email
) {
}