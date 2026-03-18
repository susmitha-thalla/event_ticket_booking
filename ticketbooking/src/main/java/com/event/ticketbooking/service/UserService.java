package com.event.ticketbooking.service;

import com.event.ticketbooking.dto.RegisterRequest;
import com.event.ticketbooking.dto.LoginRequest;
import com.event.ticketbooking.model.User;
import com.event.ticketbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ✅ REGISTER USER
    public String registerUser(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already exists!";
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(encoder.encode(request.getPassword())); // 🔐 encrypted
        user.setPhone(request.getPhone());
        user.setRole("USER");
        user.setAccountStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return "User Registered Successfully";
    }

    // ✅ LOGIN USER
    public String loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(request.getPassword(), user.getPasswordHash())) {
            return "Invalid password";
        }

        return "Login Successful";
    }
}