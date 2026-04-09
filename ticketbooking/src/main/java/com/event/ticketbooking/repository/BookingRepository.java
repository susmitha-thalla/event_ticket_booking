package com.event.ticketbooking.repository;

import com.event.ticketbooking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // =========================
    // BASIC FETCHES
    // =========================

    Optional<Booking> findByBookingIdAndIsDeletedFalse(Long bookingId);

    Optional<Booking> findByBookingCodeAndIsDeletedFalse(String bookingCode);

    Optional<Booking> findByTransactionCode(String transactionCode);

    List<Booking> findByIsDeletedFalse();

    // =========================
    // USER BOOKINGS
    // =========================

    List<Booking> findByUser_EmailAndIsDeletedFalse(String email);

    List<Booking> findByUser_UserIdAndIsDeletedFalse(Long userId);

    List<Booking> findByUser_UserIdAndBookingStatusAndIsDeletedFalse(Long userId, String bookingStatus);

    // =========================
    // EVENT BOOKINGS
    // =========================

    List<Booking> findByEvent_EventIdAndIsDeletedFalse(Long eventId);

    List<Booking> findByEvent_EventIdAndBookingStatusAndIsDeletedFalse(Long eventId, String bookingStatus);

    // =========================
    // ORGANIZER BOOKINGS
    // =========================

    List<Booking> findByEvent_CreatedByAndIsDeletedFalse(String organizerEmail);

    List<Booking> findByEvent_CreatedByAndBookingStatusAndIsDeletedFalse(String organizerEmail, String bookingStatus);

    List<Booking> findByEvent_EventIdAndEvent_CreatedByAndIsDeletedFalse(Long eventId, String organizerEmail);

    // =========================
    // PAYMENT STATUS
    // =========================

    List<Booking> findByPaymentStatusAndIsDeletedFalse(String paymentStatus);

    List<Booking> findByPaymentModeAndIsDeletedFalse(String paymentMode);

    // =========================
    // BOOKING STATUS
    // =========================

    List<Booking> findByBookingStatusAndIsDeletedFalse(String bookingStatus);

    // =========================
    // SEAT-BASED BOOKINGS
    // =========================

    List<Booking> findByEvent_EventIdAndSeatNumbersIsNotNullAndIsDeletedFalse(Long eventId);

    List<Booking> findByEvent_EventIdAndSeatNumbersContainingAndIsDeletedFalse(Long eventId, String seatNumber);

    // =========================
    // ADMIN DASHBOARD COUNTS
    // =========================

    long countByIsDeletedFalse();

    long countByBookingStatusAndIsDeletedFalse(String bookingStatus);

    long countByPaymentStatusAndIsDeletedFalse(String paymentStatus);

    long countByEvent_EventIdAndIsDeletedFalse(Long eventId);

    long countByEvent_CreatedByAndIsDeletedFalse(String organizerEmail);

    // =========================
    // REVENUE (Optional use)
    // =========================

    List<Booking> findByPaymentStatusAndBookingStatusAndIsDeletedFalse(String paymentStatus, String bookingStatus);
}