package com.telecomiq.service;

import com.telecomiq.config.JwtService;
import com.telecomiq.dto.request.LoginRequest;
import com.telecomiq.dto.request.RegisterRequest;
import com.telecomiq.dto.response.AuthResponse;
import com.telecomiq.entity.User;
import com.telecomiq.enums.Role;
import com.telecomiq.exception.BadRequestException;
import com.telecomiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService auditLogService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        Role role = Role.CUSTOMER;
        if (request.getRole() != null) {
            try {
                role = Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + request.getRole());
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        user = userRepository.save(user);
        String token = jwtService.generateToken(user);

        auditLogService.log("USER_REGISTERED", user.getEmail(), "New user registered with role: " + role);
        log.info("User registered: {} with role: {}", user.getEmail(), role);

        return AuthResponse.of(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String token = jwtService.generateToken(user);

        auditLogService.log("USER_LOGIN", user.getEmail(), "User logged in");
        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.of(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
