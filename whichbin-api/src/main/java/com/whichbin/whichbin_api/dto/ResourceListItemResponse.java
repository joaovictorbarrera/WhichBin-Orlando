package com.whichbin.whichbin_api.dto;

public record ResourceListItemResponse(
        Long id,
        String title,
        String description,
        String styleType
) {
}