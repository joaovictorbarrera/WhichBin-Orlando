package com.whichbin.whichbin_api.dto;

import java.util.List;

public record PaginatedResponse<T>(
        int currentPage,
        int totalPages,
        int pageSize,
        long totalItems,
        List<T> items
) {
}
