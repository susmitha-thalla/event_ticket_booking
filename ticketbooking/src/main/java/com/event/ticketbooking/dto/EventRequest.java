package com.event.ticketbooking.dto;

import java.time.LocalDateTime;

public class EventRequest {

    private String title;
    private String description;

    private String location;
    private String city;
    private String address;

    // Keep for backward compatibility
    private LocalDateTime eventDate;

    // New fields (important)
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Double price;

    // Seat-related
    private Boolean hasSeats;
    private Integer totalSeats;
    private Integer availableSeats;

    private String seatMapImageUrl;
    private String venueType; // OUTDOOR / INDOOR / HALL / STADIUM

    private String category;
    private String recurrenceType;

    public EventRequest() {
    }

    // ===== BASIC DETAILS =====

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // ===== LOCATION =====

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    // ===== TIME =====

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
        this.eventDate = startTime; // keep sync
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    // ===== PRICING =====

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    // ===== SEAT CONFIG =====

    public Boolean getHasSeats() {
        return hasSeats;
    }

    public void setHasSeats(Boolean hasSeats) {
        this.hasSeats = hasSeats;
    }

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }

    public String getSeatMapImageUrl() {
        return seatMapImageUrl;
    }

    public void setSeatMapImageUrl(String seatMapImageUrl) {
        this.seatMapImageUrl = seatMapImageUrl;
    }

    public String getVenueType() {
        return venueType;
    }

    public void setVenueType(String venueType) {
        this.venueType = venueType;
    }

    // ===== CATEGORY =====

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    // ===== RECURRENCE =====

    public String getRecurrenceType() {
        return recurrenceType;
    }

    public void setRecurrenceType(String recurrenceType) {
        this.recurrenceType = recurrenceType;
    }
}