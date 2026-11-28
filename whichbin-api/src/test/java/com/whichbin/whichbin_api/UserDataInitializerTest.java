
package com.whichbin.whichbin_api;

import com.whichbin.whichbin_api.data_initializer.UserDataInitializer;
import com.whichbin.whichbin_api.model.User;
import com.whichbin.whichbin_api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Profiles;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserDataInitializerTest {

    private UserRepository repository;
    private PasswordEncoder passwordEncoder;
    private UserDataInitializer initializer;

    @BeforeEach
    void setUp() {
        repository = mock(UserRepository.class);
        passwordEncoder = new BCryptPasswordEncoder(4);

        initializer = new UserDataInitializer(
                repository, passwordEncoder);

        ReflectionTestUtils.setField(initializer, "enabled", true);
        ReflectionTestUtils.setField(initializer, "firstName", "Default");
        ReflectionTestUtils.setField(initializer, "lastName", "Administrator");
        ReflectionTestUtils.setField(initializer, "email", "admin@example.com");
        ReflectionTestUtils.setField(initializer, "password", "TestPassword123!");
    }

    @Test
    void shouldCreateAdministratorWithHashedPassword() {
        initializer.run();

        ArgumentCaptor<User> captor =
                ArgumentCaptor.forClass(User.class);

        verify(repository).save(captor.capture());

        User administrator = captor.getValue();

        assertEquals("Default", administrator.getFirstName());
        assertEquals("Administrator", administrator.getLastName());
        assertEquals("admin@example.com", administrator.getEmail());
        assertNull(administrator.getInvitationToken());

        assertTrue(passwordEncoder.matches(
                "TestPassword123!",
                administrator.getPasswordHash()));
    }

    @Test
    void shouldPreserveExistingAdministrator() {
        when(repository.existsByEmailIgnoreCase("admin@example.com"))
                .thenReturn(true);

        initializer.run();

        verify(repository, never()).save(any(User.class));
    }

    @Test
    void shouldRunOnlyInDevProfile() {
        Profile annotation =
                UserDataInitializer.class.getAnnotation(Profile.class);

        assertNotNull(annotation);

        Profiles profiles = Profiles.of(annotation.value());
        MockEnvironment environment = new MockEnvironment();

        assertFalse(environment.acceptsProfiles(profiles));

        environment.setActiveProfiles("dev");
        assertTrue(environment.acceptsProfiles(profiles));

        environment.setActiveProfiles("prod");
        assertFalse(environment.acceptsProfiles(profiles));

        environment.setActiveProfiles("production");
        assertFalse(environment.acceptsProfiles(profiles));

        environment.setActiveProfiles("test");
        assertFalse(environment.acceptsProfiles(profiles));

        environment.setActiveProfiles("dev", "prod");
        assertFalse(environment.acceptsProfiles(profiles));

        environment.setActiveProfiles("dev", "production");
        assertFalse(environment.acceptsProfiles(profiles));

        environment.setActiveProfiles("dev", "test");
        assertFalse(environment.acceptsProfiles(profiles));
    }
}