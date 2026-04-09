package com.event.ticketbooking.dto;

public class LoginRequest {

    private String email;
    private String password;

    // Optional fields for future enhancements
    private String role; // USER / ORGANIZER / ADMIN (optional check)
    private String deviceInfo;
    private String ipAddress;

    public LoginRequest() {
    }

    // ===== BASIC =====

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // ===== OPTIONAL =====

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    // ===== HELPER =====

    public boolean isValid() {
        return email != null && !email.isBlank()
                && password != null && !password.isBlank();
    }
}