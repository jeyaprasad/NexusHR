package com.zidio.insiihr.service;

import com.zidio.insiihr.dto.AuthResponse;
import com.zidio.insiihr.dto.LoginRequest;
import com.zidio.insiihr.dto.RegisterRequest;
import com.zidio.insiihr.entity.Role;
import com.zidio.insiihr.entity.User;
import com.zidio.insiihr.exception.DuplicateResourceException;
import com.zidio.insiihr.repository.UserRepository;
import com.zidio.insiihr.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    // In-memory fallback since Redis is disabled
    private final Map<String, String> refreshTokens = new ConcurrentHashMap<>();
    public static final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.EMPLOYEE)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), 
                null, 
                java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        String token = jwtTokenProvider.generateToken(authentication);
        String refreshToken = UUID.randomUUID().toString();
        refreshTokens.put(refreshToken, user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .userId(user.getId())
                .refreshToken(refreshToken)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtTokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String refreshToken = UUID.randomUUID().toString();
        refreshTokens.put(refreshToken, user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .userId(user.getId())
                .refreshToken(refreshToken)
                .build();
    }

    public AuthResponse refreshToken(String refreshTokenStr) {
        String email = refreshTokens.get(refreshTokenStr);
        if (email == null) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }
        User user = userRepository.findByEmail(email).orElseThrow();
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), 
                null, 
                java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        String newToken = jwtTokenProvider.generateToken(authentication);
        String newRefreshToken = UUID.randomUUID().toString();
        
        refreshTokens.remove(refreshTokenStr);
        refreshTokens.put(newRefreshToken, user.getEmail());

        return AuthResponse.builder()
                .token(newToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .userId(user.getId())
                .refreshToken(newRefreshToken)
                .build();
    }

    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token != null) {
            blacklistedTokens.add(token);
        }
    }
}
