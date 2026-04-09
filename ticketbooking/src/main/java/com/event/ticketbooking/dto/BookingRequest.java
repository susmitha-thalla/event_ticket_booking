package com.event.ticketbooking.dto;

import java.util.List;

public class BookingRequest {

    private Long userId;
    private Long eventId;

    // Quantity (for non-seat events OR fallback)
    private Integer quantity;

    // Seat-based booking (preferred)
    private List<String> seatNumbers; // ["A1", "A2", "B1"]

    private Double totalAmount;

    private String paymentMode; // UPI / CARD / CASH / NETBANKING

    private String gender;

    // Optional (future use)
    private String bookingNote;

    public BookingRequest() {
    }

    // ===== BASIC =====

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    // ===== QUANTITY =====

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    // ===== SEATS =====

    public List<String> getSeatNumbers() {
        return seatNumbers;
    }

    public void setSeatNumbers(List<String> seatNumbers) {
        this.seatNumbers = seatNumbers;
    }

    // ===== PAYMENT =====

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    // ===== EXTRA =====

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBookingNote() {
        return bookingNote;
    }

    public void setBookingNote(String bookingNote) {
        this.bookingNote = bookingNote;
    }

    // ===== HELPER METHODS =====

    public boolean isSeatBasedBooking() {
        return seatNumbers != null && !seatNumbers.isEmpty();
    }

    public int getFinalQuantity() {
        if (isSeatBasedBooking()) {
            return seatNumbers.size();
        }
        return (quantity != null && quantity > 0) ? quantity : 1;
    }
}