package com.event.ticketbooking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    private Integer quantity;

    private Double totalAmount;

    private String qrCode;

    private LocalDateTime bookingTime;

    // 🔗 Many bookings → One user
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // 🔗 Many bookings → One event
    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    public Booking() {}

    // getters & setters
    public Long getBookingId() { return bookingId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public LocalDateTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
}