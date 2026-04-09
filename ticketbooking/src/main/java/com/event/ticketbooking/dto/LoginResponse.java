package com.event.ticketbooking.dto;

public class LoginResponse {

    private String message;

    private String token;
    private String tokenType = "Bearer";

    private String role;
    private String email;

    private Long userId;
    private String userCode;

    private String accountStatus;

    private Long expiresIn;

    public LoginResponse() {}

    // 🔥 Main constructor (recommended)
    public LoginResponse(String message, String token, String role, String email,
                         Long userId, String userCode, String accountStatus) {

        this.message = message;
        this.token = token;
        this.role = role;
        this.email = email;
        this.userId = userId;
        this.userCode = userCode;
        this.accountStatus = accountStatus;
    }

    // ===== GETTERS =====

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public String getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserCode() {
        return userCode;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    // ===== SETTERS =====

    public void setMessage(String message) {
        this.message = message;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUserCode(String userCode) {
        this.userCode = userCode;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }
}