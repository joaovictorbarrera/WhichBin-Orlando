package com.whichbin.whichbin_api.auth;

import com.whichbin.whichbin_api.model.User;
import com.whichbin.whichbin_api.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthenticationInterceptor implements HandlerInterceptor {

    public static final String AUTHENTICATED_USER_ATTRIBUTE = "authenticatedUser";

    private final UserRepository userRepository;
    private final AuthorizationTokenService authorizationTokenService;

    public AuthenticationInterceptor(
            UserRepository userRepository,
            AuthorizationTokenService authorizationTokenService
    ) {
        this.userRepository = userRepository;
        this.authorizationTokenService = authorizationTokenService;
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        boolean requiresAuthentication =
                handlerMethod.hasMethodAnnotation(Authenticated.class)
                        || handlerMethod.getBeanType().isAnnotationPresent(Authenticated.class);

        if (!requiresAuthentication) {
            return true;
        }

        String authorizationToken = extractAuthorizationToken(request);

        String authorizationHash = authorizationTokenService.hashAuthorizationToken(authorizationToken);

        User user = userRepository.findByAuthorizationHash(authorizationHash)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid authorization token"
                ));

        request.setAttribute(AUTHENTICATED_USER_ATTRIBUTE, user);

        return true;
    }

    private String extractAuthorizationToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing Authorization header"
            );
        }

        if (authorizationHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            String token = authorizationHeader.substring(7).trim();

            if (!token.isBlank()) {
                return token;
            }
        }

        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid Authorization header"
        );
    }
}