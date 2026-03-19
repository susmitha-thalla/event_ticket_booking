package com.event.ticketbooking.controller;

import com.event.ticketbooking.dto.BookingRequest;
import com.event.ticketbooking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/book")
    public String bookTicket(@RequestBody BookingRequest request) {
        return bookingService.bookTicket(request);
    }
}