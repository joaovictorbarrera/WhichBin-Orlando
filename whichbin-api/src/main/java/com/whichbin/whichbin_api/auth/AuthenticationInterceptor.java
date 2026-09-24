package com.whichbin.whichbin_api.auth;

import com.whichbin.whichbin_api.model.User;
import com.whichbin.whichbin_api.repository.UserRepository;
import com.whichbin.whichbin_api.service.AuthorizationTokenService;
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

    private final AuthorizationTokenService authorizationTokenService;

    public AuthenticationInterceptor(
            AuthorizationTokenService authorizationTokenService
    ) {
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

        String token = authorizationTokenService.extractBearerToken(request.getHeader(HttpHeaders.AUTHORIZATION))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));

        User user = authorizationTokenService.findUserByAuthorizationToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));

        request.setAttribute(AUTHENTICATED_USER_ATTRIBUTE, user);

        return true;
    }
}