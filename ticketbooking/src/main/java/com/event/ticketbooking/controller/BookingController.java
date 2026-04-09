package com.event.ticketbooking.controller;

import com.event.ticketbooking.dto.BookingRequest;
import com.event.ticketbooking.model.Booking;
import com.event.ticketbooking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // =========================
    // USER BOOKING
    // =========================

    @PostMapping("/book")
    public Booking bookTicket(@RequestBody BookingRequest request, Principal principal) {
        return bookingService.bookTicket(request, principal);
    }

    @GetMapping("/my-bookings")
    public List<Booking> getMyBookings(Principal principal) {
        return bookingService.getUserBookings(principal);
    }

    @PutMapping("/cancel/{bookingId}")
    public String cancelMyBooking(@PathVariable Long bookingId, Principal principal) {
        return bookingService.cancelBooking(bookingId, principal);
    }

    // =========================
    // ORGANIZER BOOKINGS
    // =========================

    @GetMapping("/organizer-bookings")
    public List<Booking> getOrganizerBookings(Principal principal) {
        return bookingService.getOrganizerBookings(principal);
    }

    @GetMapping("/organizer-bookings/event/{eventId}")
    public List<Booking> getOrganizerBookingsByEvent(@PathVariable Long eventId, Principal principal) {
        return bookingService.getOrganizerBookingsByEvent(eventId, principal);
    }

    // =========================
    // ADMIN BOOKINGS
    // =========================

    @GetMapping("/all")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/{bookingId}")
    public Booking getBookingById(@PathVariable Long bookingId) {
        return bookingService.getBookingById(bookingId);
    }

    @GetMapping("/event/{eventId}")
    public List<Booking> getBookingsByEventId(@PathVariable Long eventId) {
        return bookingService.getBookingsByEventId(eventId);
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getBookingsByUserId(@PathVariable Long userId) {
        return bookingService.getBookingsByUserId(userId);
    }

    @PutMapping("/admin/cancel/{bookingId}")
    public String cancelBookingByAdmin(@PathVariable Long bookingId, Principal principal) {
        return bookingService.cancelBooking(bookingId, principal);
    }
}