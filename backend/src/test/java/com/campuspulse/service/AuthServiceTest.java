package com.campuspulse.service;

import com.campuspulse.config.JwtTokenProvider;
import com.campuspulse.dto.auth.AuthResponse;
import com.campuspulse.dto.auth.RegisterRequest;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.Role;
import com.campuspulse.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerAlwaysCreatesStudentAndNormalizesEmail() {
        RegisterRequest request = new RegisterRequest(
                "Student", "  Student@Example.Test ", " CS2024001 ", "secret1");
        when(passwordEncoder.encode("secret1")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });
        when(tokenProvider.generateToken(any(), anyString(), anyString())).thenReturn("token");

        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getRole()).isEqualTo(Role.STUDENT);
        assertThat(userCaptor.getValue().getEmail()).isEqualTo("student@example.test");
        assertThat(userCaptor.getValue().getRollNo()).isEqualTo("CS2024001");
        assertThat(response.getRole()).isEqualTo(Role.STUDENT);
        verify(userRepository).existsByEmail("student@example.test");
        verify(tokenProvider).generateToken(userCaptor.getValue().getId(), "student@example.test", "STUDENT");
    }
}