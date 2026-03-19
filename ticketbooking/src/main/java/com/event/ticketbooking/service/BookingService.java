package com.event.ticketbooking.service;

import com.event.ticketbooking.dto.BookingRequest;
import com.event.ticketbooking.model.*;
import com.event.ticketbooking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    public String bookTicket(BookingRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // 💰 calculate total price
        double totalAmount = event.getPrice() * request.getQuantity();

        // 🔐 unique QR
        String qr = UUID.randomUUID().toString();

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setQuantity(request.getQuantity());
        booking.setTotalAmount(totalAmount);
        booking.setQrCode(qr);
        booking.setBookingTime(LocalDateTime.now());

        bookingRepository.save(booking);

        return "Booking Successful. QR: " + qr;
    }
}