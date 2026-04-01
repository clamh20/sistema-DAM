package com.dinero.control.controller;

import com.dinero.control.dto.AuthResponse;
import com.dinero.control.dto.LoginRequest;
import com.dinero.control.model.User;
import com.dinero.control.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // Find user
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Generate token (Stub for JWT)
        // In a real implementation this would invoke JwtUtil.generateToken()
        String token = "dummy-jwt-token-for-user-" + user.getId();
        
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getRole().getName()));
    }
}
