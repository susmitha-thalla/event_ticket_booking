package com.event.ticketbooking.dto;

public class RegisterRequest {

    private String fullName;
    private String email;
    private String password;
    private String phone;

    private String role; // USER / ORGANIZER (ADMIN should NOT be allowed from frontend)

    // Optional (future features)
    private String organizationName;
    private String city;

    public RegisterRequest() {
    }

    // ===== BASIC =====

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    // ===== ROLE =====

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    // ===== OPTIONAL =====

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    // ===== HELPER METHODS =====

    public boolean isValid() {
        return fullName != null && !fullName.isBlank()
                && email != null && !email.isBlank()
                && password != null && password.length() >= 6;
    }

    public String getSafeRole() {
        if (role == null) {
            return "USER";
        }

        String r = role.toUpperCase();

        // Prevent frontend from creating ADMIN accounts
        if (r.equals("ADMIN")) {
            return "USER";
        }

        if (r.equals("ORGANIZER")) {
            return "ORGANIZER";
        }

        return "USER";
    }
}