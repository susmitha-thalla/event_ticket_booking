package com.event.ticketbooking.controller;

import com.event.ticketbooking.dto.LoginRequest;
import com.event.ticketbooking.dto.LoginResponse;
import com.event.ticketbooking.dto.RegisterRequest;
import com.event.ticketbooking.model.User;
import com.event.ticketbooking.repository.UserRepository;
import com.event.ticketbooking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return userService.registerUser(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return userService.loginUser(request);
    }
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    }