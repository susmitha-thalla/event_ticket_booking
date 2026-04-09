package com.event.ticketbooking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventId;

    private String title;
    private String description;
    private String location;
    private LocalDateTime eventDate;
    private Double price;
    private Integer availableSeats;

    private String createdBy; // organizer email
    private String category; // MUSIC, TECH, SPORTS etc
    private String approvalStatus; // PENDING / APPROVED
    private Boolean organizerPaid;

    // NEW FIELDS FOR UPGRADE
    private Boolean hasSeats;
    private String recurrenceType; // NONE / DAILY / WEEKLY / MONTHLY
    private String eventStatus; // UPCOMING / LIVE / ENDED / DELETED
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Event() {
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.hasSeats == null) this.hasSeats = false;
        if (this.recurrenceType == null) this.recurrenceType = "NONE";
        if (this.eventStatus == null) this.eventStatus = "UPCOMING";
        if (this.isDeleted == null) this.isDeleted = false;
        if (this.approvalStatus == null) this.approvalStatus = "PENDING";
        if (this.organizerPaid == null) this.organizerPaid = false;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public Boolean getOrganizerPaid() {
        return organizerPaid;
    }

    public void setOrganizerPaid(Boolean organizerPaid) {
        this.organizerPaid = organizerPaid;
    }

    public Boolean getHasSeats() {
        return hasSeats;
    }

    public void setHasSeats(Boolean hasSeats) {
        this.hasSeats = hasSeats;
    }

    public String getRecurrenceType() {
        return recurrenceType;
    }

    public void setRecurrenceType(String recurrenceType) {
        this.recurrenceType = recurrenceType;
    }

    public String getEventStatus() {
        return eventStatus;
    }

    public void setEventStatus(String eventStatus) {
        this.eventStatus = eventStatus;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean deleted) {
        isDeleted = deleted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}