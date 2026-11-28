package com.whichbin.whichbin_api.data_initializer;

import com.whichbin.whichbin_api.model.User;
import com.whichbin.whichbin_api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
@Profile("dev & !prod & !production & !test")
public class UserDataInitializer implements CommandLineRunner {

    private static final Logger logger =
            LoggerFactory.getLogger(UserDataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.dev.admin.enabled:true}")
    private boolean enabled;

    @Value("${app.dev.admin.first-name:Default}")
    private String firstName;

    @Value("${app.dev.admin.last-name:Administrator}")
    private String lastName;

    @Value("${app.dev.admin.email:}")
    private String email;

    @Value("${app.dev.admin.password:}")
    private String password;

    public UserDataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (!enabled) {
            return;
        }

        if (email.isBlank() || password.isBlank()) {
            logger.warn(
                    "DEV administrator credentials are not configured."
            );
            return;
        }

        String normalizedEmail =
                email.trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            logger.info("DEV administrator account already exists.");
            return;
        }

        User administrator = new User(
                firstName.trim(),
                lastName.trim(),
                normalizedEmail,
                null
        );

        administrator.setPasswordHash(
                passwordEncoder.encode(password)
        );

        userRepository.save(administrator);

        logger.info("DEV administrator account created successfully.");
    }
}