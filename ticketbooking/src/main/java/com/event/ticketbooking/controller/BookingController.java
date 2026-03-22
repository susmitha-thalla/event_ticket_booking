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
@CrossOrigin
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/book")
    public Booking bookTicket(@RequestBody BookingRequest request, Principal principal) {
        return bookingService.bookTicket(request, principal);
    }

    @GetMapping("/my-bookings")
    public List<Booking> getMyBookings(Principal principal) {
        return bookingService.getUserBookings(principal);
    }

    @GetMapping("/organizer-bookings")
    public List<Booking> getOrganizerBookings(Principal principal) {
        return bookingService.getOrganizerBookings(principal);
    }

    @GetMapping("/all")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }
}