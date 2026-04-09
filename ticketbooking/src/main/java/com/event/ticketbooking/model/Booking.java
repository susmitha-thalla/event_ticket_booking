package com.event.ticketbooking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "bookings",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_booking_code", columnNames = "booking_code"),
                @UniqueConstraint(name = "uk_transaction_code", columnNames = "transaction_code")
        }
)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @Column(name = "booking_code", nullable = false, unique = true, length = 50)
    private String bookingCode;

    @Column(name = "transaction_code", unique = true, length = 60)
    private String transactionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "qr_code", length = 500)
    private String qrCode;

    @Lob
    @Column(name = "qr_image_path", columnDefinition = "LONGTEXT")
    private String qrImagePath;

    @Column(name = "payment_mode", length = 50)
    private String paymentMode; // CARD / UPI / CASH / NETBANKING

    @Column(name = "payment_status", length = 50)
    private String paymentStatus; // PENDING / SUCCESS / FAILED / REFUNDED

    @Column(name = "booking_status", length = 50)
    private String bookingStatus; // RESERVED / CONFIRMED / CANCELLED / EXPIRED

    @Column(name = "seat_numbers", length = 1000)
    private String seatNumbers; // comma-separated for now, e.g. A1,A2,B1

    @Column(length = 20)
    private String gender;

    @Column(name = "booking_time", nullable = false)
    private LocalDateTime bookingTime;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Booking() {
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.bookingCode == null || this.bookingCode.isBlank()) {
            this.bookingCode = generateBookingCode();
        }

        if (this.transactionCode == null || this.transactionCode.isBlank()) {
            this.transactionCode = generateTransactionCode();
        }

        if (this.bookingTime == null) {
            this.bookingTime = now;
        }

        if (this.quantity == null || this.quantity <= 0) {
            this.quantity = 1;
        }

        if (this.totalAmount == null) {
            this.totalAmount = 0.0;
        }

        if (this.paymentStatus == null || this.paymentStatus.isBlank()) {
            this.paymentStatus = "PENDING";
        }

        if (this.bookingStatus == null || this.bookingStatus.isBlank()) {
            this.bookingStatus = "CONFIRMED";
        }

        if (this.isDeleted == null) {
            this.isDeleted = false;
        }

        if ("CONFIRMED".equalsIgnoreCase(this.bookingStatus) && this.confirmedAt == null) {
            this.confirmedAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();

        if ("CONFIRMED".equalsIgnoreCase(this.bookingStatus) && this.confirmedAt == null) {
            this.confirmedAt = LocalDateTime.now();
        }

        if ("CANCELLED".equalsIgnoreCase(this.bookingStatus) && this.cancelledAt == null) {
            this.cancelledAt = LocalDateTime.now();
        }
    }

    private String generateBookingCode() {
        return "BKG-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
    }

    private String generateTransactionCode() {
        return "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    public boolean isSeatBasedBooking() {
        return this.seatNumbers != null && !this.seatNumbers.isBlank();
    }

    public void markConfirmed() {
        this.bookingStatus = "CONFIRMED";
        this.paymentStatus = "SUCCESS";
        this.confirmedAt = LocalDateTime.now();
    }

    public void markCancelled(String reason) {
        this.bookingStatus = "CANCELLED";
        this.cancelledAt = LocalDateTime.now();
        this.cancellationReason = reason;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getBookingCode() {
        return bookingCode;
    }

    public void setBookingCode(String bookingCode) {
        this.bookingCode = bookingCode;
    }

    public String getTransactionCode() {
        return transactionCode;
    }

    public void setTransactionCode(String transactionCode) {
        this.transactionCode = transactionCode;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public String getQrImagePath() {
        return qrImagePath;
    }

    public void setQrImagePath(String qrImagePath) {
        this.qrImagePath = qrImagePath;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public String getSeatNumbers() {
        return seatNumbers;
    }

    public void setSeatNumbers(String seatNumbers) {
        this.seatNumbers = seatNumbers;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalDateTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
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