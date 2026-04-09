package com.event.ticketbooking.service;

import com.event.ticketbooking.dto.SeatLayoutRequest;
import com.event.ticketbooking.dto.SeatViewResponse;
import com.event.ticketbooking.model.Event;
import com.event.ticketbooking.model.Seat;
import com.event.ticketbooking.model.User;
import com.event.ticketbooking.repository.EventRepository;
import com.event.ticketbooking.repository.SeatRepository;
import com.event.ticketbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SeatService {

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public String createSeatLayout(Long eventId, SeatLayoutRequest request, Principal principal) {
        if (request == null || request.getSeatCodes() == null || request.getSeatCodes().isEmpty()) {
            throw new RuntimeException("Seat codes are required");
        }

        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = eventRepository.findByEventIdAndIsDeletedFalse(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole()) || "ROLE_ADMIN".equalsIgnoreCase(user.getRole());
        boolean isOwner = event.getCreatedBy() != null && event.getCreatedBy().equalsIgnoreCase(email);

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You are not authorized to update this event's seat layout");
        }

        if (!Boolean.TRUE.equals(event.getHasSeats())) {
            throw new RuntimeException("This event is not marked as seat based");
        }

        Set<String> uniqueSeatCodes = request.getSeatCodes().stream()
                .filter(code -> code != null && !code.isBlank())
                .map(code -> code.trim().toUpperCase(Locale.ROOT))
                .collect(Collectors.toSet());

        if (uniqueSeatCodes.isEmpty()) {
            throw new RuntimeException("No valid seat codes found");
        }

        int createdCount = 0;
        List<Seat> createdSeats = new ArrayList<>();

        for (String seatCode : uniqueSeatCodes) {
            if (seatRepository.existsByEvent_EventIdAndSeatCodeAndIsDeletedFalse(eventId, seatCode)) {
                continue;
            }

            Seat seat = new Seat();
            seat.setEvent(event);
            seat.setSeatCode(seatCode);
            seat.setRowLabel(extractRowLabel(seatCode));
            seat.setSeatNumber(extractSeatNumber(seatCode));
            seat.setSectionName(request.getSectionName() != null ? request.getSectionName() : "MAIN");
            seat.setSeatType(request.getSeatType() != null ? request.getSeatType() : "REGULAR");
            seat.setPriceOverride(request.getPriceOverride());
            seat.setSeatStatus("AVAILABLE");
            seat.setIsDeleted(false);

            createdSeats.add(seat);
            createdCount++;
        }

        if (!createdSeats.isEmpty()) {
            seatRepository.saveAll(createdSeats);
        }

        long availableCount = seatRepository.countByEvent_EventIdAndSeatStatusAndIsDeletedFalse(eventId, "AVAILABLE");
        event.setAvailableSeats((int) availableCount);
        eventRepository.save(event);

        return "Seat layout saved successfully. Seats created: " + createdCount;
    }

    public List<String> getAvailableSeatsByEventId(Long eventId) {
        return seatRepository.findByEvent_EventIdAndSeatStatusAndIsDeletedFalse(eventId, "AVAILABLE")
                .stream()
                .map(Seat::getSeatCode)
                .filter(code -> code != null && !code.isBlank())
                .map(String::trim)
                .map(code -> code.toUpperCase(Locale.ROOT))
                .distinct()
                .toList();
    }

    public List<SeatViewResponse> getSeatMapByEventId(Long eventId) {
        return seatRepository.findByEvent_EventIdAndIsDeletedFalse(eventId)
                .stream()
                .sorted(Comparator
                        .comparing((Seat seat) -> seat.getRowLabel() == null ? "" : seat.getRowLabel())
                        .thenComparing(seat -> seat.getSeatNumber() == null ? Integer.MAX_VALUE : seat.getSeatNumber()))
                .map(seat -> new SeatViewResponse(
                        seat.getSeatCode(),
                        seat.getRowLabel(),
                        seat.getSeatNumber(),
                        seat.getSeatStatus(),
                        seat.getSectionName(),
                        seat.getSeatType(),
                        seat.getPriceOverride()
                ))
                .toList();
    }

    private String extractRowLabel(String seatCode) {
        Pattern rowPattern = Pattern.compile("^[A-Z]+");
        Matcher matcher = rowPattern.matcher(seatCode);
        return matcher.find() ? matcher.group() : null;
    }

    private Integer extractSeatNumber(String seatCode) {
        Pattern numberPattern = Pattern.compile("(\\d+)$");
        Matcher matcher = numberPattern.matcher(seatCode);
        if (!matcher.find()) {
            return null;
        }
        try {
            return Integer.parseInt(matcher.group(1));
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
