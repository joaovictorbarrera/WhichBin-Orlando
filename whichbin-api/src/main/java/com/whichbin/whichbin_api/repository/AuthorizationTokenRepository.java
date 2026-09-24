package com.whichbin.whichbin_api.repository;

import com.whichbin.whichbin_api.model.AuthorizationToken;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.time.Instant;
import java.util.Optional;

public interface AuthorizationTokenRepository extends JpaRepository<AuthorizationToken, Long> {

    @EntityGraph(attributePaths = "user")
    Optional<AuthorizationToken> findByAuthorizationHash(String authorizationHash);

    @Modifying
    void deleteByAuthorizationHash(String authorizationHash);

    @Modifying
    int deleteByExpiresAtBefore(Instant now);
}