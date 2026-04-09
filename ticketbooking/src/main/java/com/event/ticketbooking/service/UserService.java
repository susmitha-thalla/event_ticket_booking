package com.event.ticketbooking.service;

import com.event.ticketbooking.dto.LoginRequest;
import com.event.ticketbooking.dto.LoginResponse;
import com.event.ticketbooking.dto.RegisterRequest;
import com.event.ticketbooking.model.User;
import com.event.ticketbooking.repository.UserRepository;
import com.event.ticketbooking.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // REGISTER USER / ORGANIZER / ADMIN
    public String registerUser(RegisterRequest request) {

        if (request == null || !request.isValid()) {
            return "Invalid registration data";
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            return "Email already exists!";
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());

        // Normalize and save valid role
        String role = normalizeRole(request.getSafeRole());
        user.setRole(role);

        user.setAccountStatus("ACTIVE");
        user.setIsDeleted(false);

        userRepository.save(user);

        return switch (role) {
            case "ADMIN" -> "Admin registered successfully";
            case "ORGANIZER" -> "Organizer registered successfully";
            default -> "User registered successfully";
        };
    }

    // LOGIN USER / ORGANIZER / ADMIN
    public LoginResponse loginUser(LoginRequest request) {

        if (request == null || !request.isValid()) {
            throw new RuntimeException("Invalid login data");
        }

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new RuntimeException("Account is deleted");
        }

        if (user.getAccountStatus() != null &&
                !"ACTIVE".equalsIgnoreCase(user.getAccountStatus())) {
            throw new RuntimeException("Account is not active");
        }

        if (!encoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        String actualRole = normalizeRole(user.getRole());

        // Optional role check if frontend sends role
        if (request.getRole() != null && !request.getRole().isBlank()) {
            String requestedRole = normalizeRole(request.getRole());
            if (!actualRole.equals(requestedRole)) {
                throw new RuntimeException("Role mismatch");
            }
        }

        user.setRole(actualRole); // keep DB/user object normalized
        user.updateLastLogin();
        userRepository.save(user);

        String token = jwtUtil.generateTokenWithRole(user.getEmail(), actualRole);

        String message = switch (actualRole) {
            case "ADMIN" -> "Admin logged in successfully";
            case "ORGANIZER" -> "Organizer logged in successfully";
            default -> "User logged in successfully";
        };

        LoginResponse response = new LoginResponse(
                message,
                token,
                actualRole,
                user.getEmail(),
                user.getUserId(),
                user.getUserCode(),
                user.getAccountStatus()
        );

        response.setTokenType("Bearer");
        response.setExpiresIn(null);

        return response;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .filter(user -> !Boolean.TRUE.equals(user.getIsDeleted()))
                .toList();
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public String blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.markBlocked();
        userRepository.save(user);

        return "User blocked successfully";
    }

    public String softDeleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.markDeleted();
        userRepository.save(user);

        return "User deleted successfully";
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "USER";
        }

        String normalized = role.trim().toUpperCase(Locale.ROOT);

        return switch (normalized) {
            case "ADMIN" -> "ADMIN";
            case "ORGANIZER", "ORGANISER", "ORAGANIZER", "ORAGANISER" -> "ORGANIZER";
            case "USER", "USERS" -> "USER";
            default -> "USER";
        };
    }
}