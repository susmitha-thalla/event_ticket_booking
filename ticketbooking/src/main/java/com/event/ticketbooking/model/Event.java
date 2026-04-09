package com.event.ticketbooking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "events",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_event_code", columnNames = "event_code")
        }
)
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventId;

    @Column(name = "event_code", nullable = false, unique = true, length = 50)
    private String eventCode;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 255)
    private String location;

    // Existing field kept for compatibility with your current code/service/controller
    private LocalDateTime eventDate;

    // New recommended fields
    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(nullable = false)
    private Double price;

    @Column(name = "available_seats")
    private Integer availableSeats;

    @Column(name = "total_seats")
    private Integer totalSeats;

    @Column(name = "created_by", length = 255)
    private String createdBy; // organizer email

    @Column(length = 100)
    private String category; // MUSIC, TECH, SPORTS etc

    @Column(name = "approval_status", length = 50)
    private String approvalStatus; // PENDING / APPROVED / REJECTED

    @Column(name = "organizer_paid")
    private Boolean organizerPaid;

    @Column(name = "has_seats", nullable = false)
    private Boolean hasSeats;

    @Column(name = "seat_map_image_url", length = 1000)
    private String seatMapImageUrl;

    @Column(name = "venue_type", length = 100)
    private String venueType; // OUTDOOR / INDOOR / HALL / STADIUM / CONVENTION

    @Column(name = "recurrence_type", length = 50)
    private String recurrenceType; // NONE / DAILY / WEEKLY / MONTHLY

    @Column(name = "event_status", length = 50)
    private String eventStatus; // UPCOMING / LIVE / COMPLETED / CANCELLED / DELETED

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by", length = 255)
    private String deletedBy;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Event() {
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.eventCode == null || this.eventCode.isBlank()) {
            this.eventCode = generateEventCode();
        }

        if (this.hasSeats == null) {
            this.hasSeats = false;
        }

        if (this.recurrenceType == null || this.recurrenceType.isBlank()) {
            this.recurrenceType = "NONE";
        }

        if (this.isDeleted == null) {
            this.isDeleted = false;
        }

        if (this.approvalStatus == null || this.approvalStatus.isBlank()) {
            this.approvalStatus = "PENDING";
        }

        if (this.organizerPaid == null) {
            this.organizerPaid = false;
        }

        if (this.price == null) {
            this.price = 0.0;
        }

        // Keep backward compatibility:
        // if startTime is missing but eventDate is present, use eventDate as startTime
        if (this.startTime == null && this.eventDate != null) {
            this.startTime = this.eventDate;
        }

        // if eventDate is missing but startTime is present, sync eventDate
        if (this.eventDate == null && this.startTime != null) {
            this.eventDate = this.startTime;
        }

        // Default end time: 2 hours after start time if not supplied
        if (this.endTime == null && this.startTime != null) {
            this.endTime = this.startTime.plusHours(2);
        }

        // Seat defaults
        if (Boolean.TRUE.equals(this.hasSeats)) {
            if (this.totalSeats == null && this.availableSeats != null) {
                this.totalSeats = this.availableSeats;
            }
            if (this.availableSeats == null && this.totalSeats != null) {
                this.availableSeats = this.totalSeats;
            }
        } else {
            // Non-seat event can still use availableSeats as ticket capacity if you want,
            // so we do not forcibly set it to null.
            if (this.totalSeats == null) {
                this.totalSeats = this.availableSeats;
            }
        }

        this.eventStatus = calculateEventStatus();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();

        // Sync compatibility fields
        if (this.startTime == null && this.eventDate != null) {
            this.startTime = this.eventDate;
        }
        if (this.eventDate == null && this.startTime != null) {
            this.eventDate = this.startTime;
        }
        if (this.endTime == null && this.startTime != null) {
            this.endTime = this.startTime.plusHours(2);
        }

        this.eventStatus = calculateEventStatus();
    }

    private String generateEventCode() {
        return "EVT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
    }

    public String calculateEventStatus() {
        if (Boolean.TRUE.equals(this.isDeleted)) {
            return "DELETED";
        }

        if ("CANCELLED".equalsIgnoreCase(this.eventStatus)) {
            return "CANCELLED";
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = (this.startTime != null) ? this.startTime : this.eventDate;
        LocalDateTime end = this.endTime;

        if (start == null) {
            return "UPCOMING";
        }

        if (end == null) {
            end = start.plusHours(2);
        }

        if (now.isBefore(start)) {
            return "UPCOMING";
        } else if ((now.isEqual(start) || now.isAfter(start)) && now.isBefore(end)) {
            return "LIVE";
        } else {
            return "COMPLETED";
        }
    }

    public boolean isUpcomingWithinDays(long days) {
        LocalDateTime start = (this.startTime != null) ? this.startTime : this.eventDate;
        if (start == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime limit = now.plusDays(days);

        return start.isAfter(now) && (start.isBefore(limit) || start.isEqual(limit));
    }

    public void markDeleted(String deletedBy) {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = deletedBy;
        this.eventStatus = "DELETED";
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getEventCode() {
        return eventCode;
    }

    public void setEventCode(String eventCode) {
        this.eventCode = eventCode;
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
        if (this.startTime == null) {
            this.startTime = eventDate;
        }
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
        this.eventDate = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
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

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
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

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public String getDeletedBy() {
        return deletedBy;
    }

    public void setDeletedBy(String deletedBy) {
        this.deletedBy = deletedBy;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}