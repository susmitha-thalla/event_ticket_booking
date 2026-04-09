package com.event.ticketbooking.service;

import com.event.ticketbooking.dto.BookingRequest;
import com.event.ticketbooking.model.Booking;
import com.event.ticketbooking.model.BookedSeat;
import com.event.ticketbooking.model.Event;
import com.event.ticketbooking.model.Seat;
import com.event.ticketbooking.model.User;
import com.event.ticketbooking.repository.BookedSeatRepository;
import com.event.ticketbooking.repository.BookingRepository;
import com.event.ticketbooking.repository.EventRepository;
import com.event.ticketbooking.repository.SeatRepository;
import com.event.ticketbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private BookedSeatRepository bookedSeatRepository;

    @Autowired
    private QrService qrService;

    @Transactional
    public Booking bookTicket(BookingRequest request, Principal principal) {
        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!isNormalUser(user)) {
            throw new RuntimeException("Only users can book tickets");
        }

        if (request == null) {
            throw new RuntimeException("Booking request cannot be null");
        }

        Event event = eventRepository.findByEventIdAndIsDeletedFalse(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        refreshEventStatus(event);

        if (Boolean.TRUE.equals(event.getIsDeleted())) {
            throw new RuntimeException("This event is deleted");
        }

        if (!"APPROVED".equalsIgnoreCase(event.getApprovalStatus())) {
            throw new RuntimeException("Only approved events can be booked");
        }

        if (!"UPCOMING".equalsIgnoreCase(event.getEventStatus()) &&
                !"LIVE".equalsIgnoreCase(event.getEventStatus())) {
            throw new RuntimeException("Tickets can only be booked for upcoming or live events");
        }

        int quantity = request.getFinalQuantity();
        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (event.getAvailableSeats() == null || event.getAvailableSeats() < quantity) {
            throw new RuntimeException("Not enough seats/tickets available");
        }

        List<Seat> selectedSeats = new ArrayList<>();
        String finalSeatNumbers = null;

        if (Boolean.TRUE.equals(event.getHasSeats())) {
            if (!request.isSeatBasedBooking()) {
                throw new RuntimeException("This event requires seat selection");
            }

            if (request.getSeatNumbers() == null || request.getSeatNumbers().size() != 1) {
                throw new RuntimeException("For seat-based events, one user can book only one seat per booking");
            }

            selectedSeats = validateAndLoadSeats(request, event);
            quantity = selectedSeats.size();

            finalSeatNumbers = selectedSeats.stream()
                    .map(Seat::getSeatCode)
                    .collect(Collectors.joining(","));
        } else {
            if (request.isSeatBasedBooking()) {
                throw new RuntimeException("This event does not support seat selection");
            }
        }

        double totalAmount = calculateTotalAmount(event, selectedSeats, quantity, request.getTotalAmount());

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setQuantity(quantity);
        booking.setTotalAmount(totalAmount);
        booking.setPaymentMode(request.getPaymentMode());
        booking.setPaymentStatus("SUCCESS");
        booking.setBookingStatus("CONFIRMED");
        booking.setSeatNumbers(finalSeatNumbers);
        booking.setGender(request.getGender());
        booking.setBookingTime(LocalDateTime.now());
        booking.setConfirmedAt(LocalDateTime.now());

        String qrText;
        try {
            qrText = qrService.generateBookingQrText(
                    booking.getBookingCode() != null ? booking.getBookingCode() : "PENDING",
                    event.getTitle(),
                    user.getEmail()
            );
        } catch (Exception ex) {
            qrText = "BOOKING-" + java.util.UUID.randomUUID();
        }

        booking.setQrCode(qrText);
        booking.setQrImagePath(qrService.generateQrImage(qrText));

        Booking savedBooking = bookingRepository.save(booking);

        if (!selectedSeats.isEmpty()) {
            for (Seat seat : selectedSeats) {
                seat.setSeatStatus("BOOKED");
                seatRepository.save(seat);

                BookedSeat bookedSeat = new BookedSeat();
                bookedSeat.setBooking(savedBooking);
                bookedSeat.setSeat(seat);
                bookedSeat.setEvent(event);
                bookedSeat.setSeatCode(seat.getSeatCode());
                bookedSeatRepository.save(bookedSeat);
            }
        }

        event.setAvailableSeats(event.getAvailableSeats() - quantity);
        eventRepository.save(event);

        return savedBooking;
    }

    public List<Booking> getUserBookings(Principal principal) {
        return bookingRepository.findByUser_EmailAndIsDeletedFalse(principal.getName());
    }

    public List<Booking> getOrganizerBookings(Principal principal) {
        return bookingRepository.findByEvent_CreatedByAndIsDeletedFalse(principal.getName());
    }

    public List<Booking> getOrganizerBookingsByEvent(Long eventId, Principal principal) {
        return bookingRepository.findByEvent_EventIdAndEvent_CreatedByAndIsDeletedFalse(
                eventId,
                principal.getName()
        );
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findByIsDeletedFalse();
    }

    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findByBookingIdAndIsDeletedFalse(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<Booking> getBookingsByEventId(Long eventId) {
        return bookingRepository.findByEvent_EventIdAndIsDeletedFalse(eventId);
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUser_UserIdAndIsDeletedFalse(userId);
    }

    @Transactional
    public String cancelBooking(Long bookingId, Principal principal) {
        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findByBookingIdAndIsDeletedFalse(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isAdmin = isAdmin(user);
        boolean isOwner = booking.getUser() != null
                && booking.getUser().getEmail() != null
                && booking.getUser().getEmail().equalsIgnoreCase(email);

        boolean isOrganizerOfEvent = booking.getEvent() != null
                && booking.getEvent().getCreatedBy() != null
                && booking.getEvent().getCreatedBy().equalsIgnoreCase(email);

        if (!isAdmin && !isOwner && !isOrganizerOfEvent) {
            throw new RuntimeException("You are not authorized to cancel this booking");
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getBookingStatus())) {
            return "Booking is already cancelled";
        }

        Event event = booking.getEvent();

        List<BookedSeat> bookedSeats = bookedSeatRepository.findByBooking_BookingId(booking.getBookingId());
        for (BookedSeat bookedSeat : bookedSeats) {
            Seat seat = bookedSeat.getSeat();
            if (seat != null && !Boolean.TRUE.equals(seat.getIsDeleted())) {
                seat.setSeatStatus("AVAILABLE");
                seatRepository.save(seat);
            }
        }

        if (event != null && !Boolean.TRUE.equals(event.getIsDeleted())) {
            int restoreCount = booking.getQuantity() != null ? booking.getQuantity() : 0;
            int currentAvailable = event.getAvailableSeats() != null ? event.getAvailableSeats() : 0;
            event.setAvailableSeats(currentAvailable + restoreCount);
            eventRepository.save(event);
        }

        booking.markCancelled("Cancelled by " + email);
        booking.setPaymentStatus("REFUNDED");
        bookingRepository.save(booking);

        return "Booking cancelled successfully";
    }

    private List<Seat> validateAndLoadSeats(BookingRequest request, Event event) {
        List<String> requestedSeats = request.getSeatNumbers();

        if (requestedSeats == null || requestedSeats.isEmpty()) {
            throw new RuntimeException("Please select at least one seat");
        }

        long distinctCount = requestedSeats.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .map(String::toUpperCase)
                .distinct()
                .count();

        if (distinctCount != requestedSeats.size()) {
            throw new RuntimeException("Duplicate seat numbers selected in request");
        }

        List<Seat> selectedSeats = new ArrayList<>();

        for (String seatCodeRaw : requestedSeats) {
            String seatCode = seatCodeRaw.trim().toUpperCase();

            Seat seat = seatRepository.findByEvent_EventIdAndSeatCodeAndIsDeletedFalse(event.getEventId(), seatCode)
                    .orElseThrow(() -> new RuntimeException("Seat not found: " + seatCode));

            if (!"AVAILABLE".equalsIgnoreCase(seat.getSeatStatus())) {
                throw new RuntimeException("Seat is not available: " + seatCode);
            }

            if (bookedSeatRepository.existsByEvent_EventIdAndSeat_SeatId(event.getEventId(), seat.getSeatId())) {
                throw new RuntimeException("Seat already booked: " + seatCode);
            }

            selectedSeats.add(seat);
        }

        return selectedSeats;
    }

    private double calculateTotalAmount(Event event, List<Seat> selectedSeats, int quantity, Double requestTotalAmount) {
        double calculatedAmount;

        if (selectedSeats != null && !selectedSeats.isEmpty()) {
            calculatedAmount = selectedSeats.stream()
                    .mapToDouble(seat -> seat.getPriceOverride() != null
                            ? seat.getPriceOverride()
                            : (event.getPrice() != null ? event.getPrice() : 0.0))
                    .sum();
        } else {
            double eventPrice = event.getPrice() != null ? event.getPrice() : 0.0;
            calculatedAmount = eventPrice * quantity;
        }

        if (requestTotalAmount != null && requestTotalAmount < 0) {
            throw new RuntimeException("Invalid total amount");
        }

        return calculatedAmount;
    }

    private void refreshEventStatus(Event event) {
        String newStatus = calculateEventStatus(event.getEventDate());
        if (event.getEventStatus() == null || !newStatus.equalsIgnoreCase(event.getEventStatus())) {
            event.setEventStatus(newStatus);
            eventRepository.save(event);
        }
    }

    private String calculateEventStatus(LocalDateTime eventDate) {
        if (eventDate == null) {
            return "UPCOMING";
        }

        LocalDateTime now = LocalDateTime.now();

        if (eventDate.isAfter(now)) {
            return "UPCOMING";
        } else if (eventDate.isBefore(now.minusHours(3))) {
            return "ENDED";
        } else {
            return "LIVE";
        }
    }

    private boolean isNormalUser(User user) {
        return user != null && (
                "USER".equalsIgnoreCase(user.getRole()) ||
                        "ROLE_USER".equalsIgnoreCase(user.getRole())
        );
    }

    private boolean isAdmin(User user) {
        return user != null && (
                "ADMIN".equalsIgnoreCase(user.getRole()) ||
                        "ROLE_ADMIN".equalsIgnoreCase(user.getRole())
        );
    }
}
