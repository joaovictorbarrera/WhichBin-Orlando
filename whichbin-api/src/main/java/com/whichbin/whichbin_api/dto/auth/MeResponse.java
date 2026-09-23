package com.whichbin.whichbin_api.dto.auth;

public record MeResponse(
        Long id,
        String firstName,
        String lastName,
        String email
) {
}