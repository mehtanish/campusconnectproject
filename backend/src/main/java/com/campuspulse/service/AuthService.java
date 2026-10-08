package com.campuspulse.service;

import com.campuspulse.config.JwtTokenProvider;
import com.campuspulse.dto.auth.AuthResponse;
import com.campuspulse.dto.auth.LoginRequest;
import com.campuspulse.dto.auth.RegisterRequest;
import com.campuspulse.model.User;
import com.campuspulse.model.enums.Role;
import com.campuspulse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @SuppressWarnings("null")
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String rollNo = request.getRollNo().trim();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }
        if (userRepository.existsByRollNo(rollNo)) {
            throw new RuntimeException("Roll number already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .rollNo(rollNo)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .rollNo(user.getRollNo())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .rollNo(user.getRollNo())
                .role(user.getRole())
                .build();
    }

    public AuthResponse getCurrentUser(User user) {
        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .rollNo(user.getRollNo())
                .role(user.getRole())
                .build();
    }
}
