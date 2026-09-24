package com.whichbin.whichbin_api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(
        name = "authorization_tokens",
        indexes = {
                @Index(name = "idx_authorization_tokens_hash", columnList = "authorization_hash", unique = true),
                @Index(name = "idx_authorization_tokens_expires_at", columnList = "expires_at"),
                @Index(name = "idx_authorization_tokens_user_id", columnList = "user_id")
        }
)
public class AuthorizationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "authorization_hash", nullable = false, unique = true, length = 64)
    private String authorizationHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_authorization_tokens_user_id")
    )
    private User user;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    protected AuthorizationToken() {
    }

    public AuthorizationToken(String authorizationHash, User user, Instant createdAt, Instant expiresAt) {
        this.authorizationHash = authorizationHash;
        this.user = user;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public String getAuthorizationHash() {
        return authorizationHash;
    }

    public void setAuthorizationHash(String authorizationHash) {
        this.authorizationHash = authorizationHash;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isExpired(Instant now) {
        return !expiresAt.isAfter(now);
    }

    public boolean isPastHalfLife(Instant now) {
        Instant halfLife = createdAt.plusMillis(
                (expiresAt.toEpochMilli() - createdAt.toEpochMilli()) / 2
        );

        return !now.isBefore(halfLife);
    }
}