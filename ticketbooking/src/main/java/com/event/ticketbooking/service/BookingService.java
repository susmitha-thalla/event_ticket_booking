package com.event.ticketbooking.service;

import com.event.ticketbooking.dto.BookingRequest;
import com.event.ticketbooking.model.Booking;
import com.event.ticketbooking.model.Event;
import com.event.ticketbooking.model.User;
import com.event.ticketbooking.repository.BookingRepository;
import com.event.ticketbooking.repository.EventRepository;
import com.event.ticketbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QrService qrService;

    public Booking bookTicket(BookingRequest request, Principal principal) {

        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"USER".equals(user.getRole()) && !"ROLE_USER".equals(user.getRole())) {
            throw new RuntimeException("Only users can book tickets!");
        }

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!"APPROVED".equals(event.getApprovalStatus())) {
            throw new RuntimeException("Only approved events can be booked");
        }

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (event.getAvailableSeats() < request.getQuantity()) {
            throw new RuntimeException("Not enough seats available!");
        }

        double totalAmount = event.getPrice() * request.getQuantity();
        String qr = UUID.randomUUID().toString();
        String qrImagePath = qrService.generateQrImage(qr);

        System.out.println("Generated QR image path: " + qrImagePath);

        event.setAvailableSeats(event.getAvailableSeats() - request.getQuantity());
        eventRepository.save(event);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setQuantity(request.getQuantity());
        booking.setTotalAmount(totalAmount);
        booking.setQrCode(qr);
        booking.setQrImagePath(qrImagePath);
        booking.setPaymentMode(request.getPaymentMode());
        booking.setPaymentStatus("SUCCESS");
        booking.setSeatNumbers(request.getSeatNumbers());
        booking.setGender(request.getGender());
        booking.setBookingTime(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings(Principal principal) {
        return bookingRepository.findByUser_Email(principal.getName());
    }

    public List<Booking> getOrganizerBookings(Principal principal) {
        return bookingRepository.findByEvent_CreatedBy(principal.getName());
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}