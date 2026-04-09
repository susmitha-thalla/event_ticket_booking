package com.event.ticketbooking.service;

import com.event.ticketbooking.dto.EventRequest;
import com.event.ticketbooking.model.Event;
import com.event.ticketbooking.model.User;
import com.event.ticketbooking.repository.EventRepository;
import com.event.ticketbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    public String createEvent(EventRequest request, Principal principal) {
        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!isOrganizer(user)) {
            return "Only organizers can create events!";
        }

        validateEventRequest(request);

        Event event = new Event();
        mapRequestToEvent(event, request, user);

        event.setCreatedBy(user.getEmail());
        event.setApprovalStatus("PENDING");
        event.setOrganizerPaid(true);
        event.setIsDeleted(false);

        event.setEventStatus(event.calculateEventStatus());

        eventRepository.save(event);

        return "Event created successfully and sent for admin approval";
    }

    public List<Event> getAllEvents() {
        refreshAllStatuses();
        return eventRepository.findByApprovalStatusAndIsDeletedFalse("APPROVED")
                .stream()
                .filter(event -> !Boolean.TRUE.equals(event.getIsDeleted()))
                .sorted(Comparator.comparing(
                        e -> e.getStartTime() != null ? e.getStartTime() : e.getEventDate(),
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public List<Event> getByCategory(String category) {
        refreshAllStatuses();
        return eventRepository.findByCategoryAndApprovalStatusAndIsDeletedFalse(category, "APPROVED")
                .stream()
                .sorted(Comparator.comparing(
                        e -> e.getStartTime() != null ? e.getStartTime() : e.getEventDate(),
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public List<Event> getByLocation(String location) {
        refreshAllStatuses();
        return eventRepository.findByLocationAndApprovalStatusAndIsDeletedFalse(location, "APPROVED")
                .stream()
                .sorted(Comparator.comparing(
                        e -> e.getStartTime() != null ? e.getStartTime() : e.getEventDate(),
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public List<Event> getByCategoryAndLocation(String category, String location) {
        refreshAllStatuses();
        return eventRepository.findByCategoryAndLocationAndApprovalStatusAndIsDeletedFalse(
                        category, location, "APPROVED"
                )
                .stream()
                .sorted(Comparator.comparing(
                        e -> e.getStartTime() != null ? e.getStartTime() : e.getEventDate(),
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public List<Event> getByDateRange(LocalDateTime start, LocalDateTime end) {
        refreshAllStatuses();
        return eventRepository.findByStartTimeBetweenAndApprovalStatusAndIsDeletedFalse(
                        start, end, "APPROVED"
                )
                .stream()
                .sorted(Comparator.comparing(
                        Event::getStartTime,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public List<Event> getOrganizerEvents(Principal principal) {
        refreshAllStatuses();
        return eventRepository.findByCreatedByAndIsDeletedFalse(principal.getName())
                .stream()
                .sorted(Comparator.comparing(
                        e -> e.getCreatedAt() != null ? e.getCreatedAt() : LocalDateTime.MIN,
                        Comparator.reverseOrder()
                ))
                .toList();
    }

    public List<Event> getOrganizerApprovedEvents(Principal principal) {
        refreshAllStatuses();
        return eventRepository.findByCreatedByAndApprovalStatusAndIsDeletedFalse(
                        principal.getName(), "APPROVED"
                )
                .stream()
                .sorted(Comparator.comparing(
                        e -> e.getStartTime() != null ? e.getStartTime() : e.getEventDate(),
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public List<Event> getOrganizerPendingEvents(Principal principal) {
        refreshAllStatuses();
        return eventRepository.findByCreatedByAndApprovalStatusAndIsDeletedFalse(
                        principal.getName(), "PENDING"
                )
                .stream()
                .sorted(Comparator.comparing(
                        e -> e.getCreatedAt() != null ? e.getCreatedAt() : LocalDateTime.MIN,
                        Comparator.reverseOrder()
                ))
                .toList();
    }

    public List<Event> getAllEventsForAdmin() {
        refreshAllStatuses();
        return eventRepository.findByIsDeletedFalse()
                .stream()
                .sorted(Comparator.comparing(
                        e -> e.getCreatedAt() != null ? e.getCreatedAt() : LocalDateTime.MIN,
                        Comparator.reverseOrder()
                ))
                .toList();
    }

    public List<Event> getPendingEventsForAdmin() {
        refreshAllStatuses();
        return eventRepository.findByApprovalStatusAndIsDeletedFalse("PENDING")
                .stream()
                .sorted(Comparator.comparing(
                        e -> e.getCreatedAt() != null ? e.getCreatedAt() : LocalDateTime.MIN,
                        Comparator.reverseOrder()
                ))
                .toList();
    }

    public String approveEvent(Long eventId) {
        Event event = eventRepository.findByEventIdAndIsDeletedFalse(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (Boolean.TRUE.equals(event.getIsDeleted())) {
            return "Cannot approve a deleted event";
        }

        event.setApprovalStatus("APPROVED");
        event.setEventStatus(event.calculateEventStatus());
        eventRepository.save(event);

        return "Event approved successfully";
    }

    public String rejectEvent(Long eventId) {
        Event event = eventRepository.findByEventIdAndIsDeletedFalse(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (Boolean.TRUE.equals(event.getIsDeleted())) {
            return "Cannot reject a deleted event";
        }

        event.setApprovalStatus("REJECTED");
        eventRepository.save(event);

        return "Event rejected successfully";
    }

    public Event getEventById(Long eventId) {
        Event event = eventRepository.findByEventIdAndIsDeletedFalse(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        refreshStatusIfNeeded(event);
        return event;
    }

    public List<Event> getLiveEvents() {
        refreshAllStatuses();
        return eventRepository.findByEventStatusAndApprovalStatusAndIsDeletedFalse("LIVE", "APPROVED")
                .stream()
                .sorted(Comparator.comparing(
                        Event::getStartTime,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public List<Event> getUpcomingEvents() {
        refreshAllStatuses();
        return eventRepository.findByEventStatusAndApprovalStatusAndIsDeletedFalse("UPCOMING", "APPROVED")
                .stream()
                .sorted(Comparator.comparing(
                        Event::getStartTime,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public List<Event> getCompletedEvents() {
        refreshAllStatuses();
        return eventRepository.findByEventStatusAndApprovalStatusAndIsDeletedFalse("COMPLETED", "APPROVED")
                .stream()
                .sorted(Comparator.comparing(
                        Event::getStartTime,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .toList();
    }

    public List<Event> getStartingSoonEvents() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextTwoDays = now.plusDays(2);

        refreshAllStatuses();

        return eventRepository.findByStartTimeBetweenAndApprovalStatusAndIsDeletedFalse(
                        now, nextTwoDays, "APPROVED"
                )
                .stream()
                .filter(event -> "UPCOMING".equalsIgnoreCase(event.getEventStatus())
                        || "LIVE".equalsIgnoreCase(event.getEventStatus()))
                .sorted(Comparator.comparing(
                        Event::getStartTime,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public List<Event> getSeatBasedEvents() {
        refreshAllStatuses();
        return eventRepository.findByHasSeatsAndApprovalStatusAndIsDeletedFalse(true, "APPROVED")
                .stream()
                .sorted(Comparator.comparing(
                        Event::getStartTime,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public List<Event> getNonSeatBasedEvents() {
        refreshAllStatuses();
        return eventRepository.findByHasSeatsAndApprovalStatusAndIsDeletedFalse(false, "APPROVED")
                .stream()
                .sorted(Comparator.comparing(
                        Event::getStartTime,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .toList();
    }

    public String updateEvent(Long eventId, EventRequest request, Principal principal) {
        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = eventRepository.findByEventIdAndIsDeletedFalse(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        boolean isAdmin = isAdmin(user);
        boolean isOwner = event.getCreatedBy() != null && event.getCreatedBy().equalsIgnoreCase(email);

        if (!isAdmin && !isOwner) {
            return "You are not authorized to update this event";
        }

        validateEventRequest(request);
        mapRequestToEvent(event, request, user);

        if (!isAdmin) {
            event.setApprovalStatus("PENDING");
        }

        event.setEventStatus(event.calculateEventStatus());
        eventRepository.save(event);

        return "Event updated successfully";
    }

    public String softDeleteEvent(Long eventId, Principal principal) {
        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = eventRepository.findByEventIdAndIsDeletedFalse(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        boolean isAdmin = isAdmin(user);
        boolean isOwner = event.getCreatedBy() != null && event.getCreatedBy().equalsIgnoreCase(email);

        if (!isAdmin && !isOwner) {
            return "You are not authorized to delete this event";
        }

        event.markDeleted(email);
        eventRepository.save(event);

        return "Event deleted successfully";
    }

    public void refreshAllStatuses() {
        List<Event> events = eventRepository.findByIsDeletedFalse();
        for (Event event : events) {
            refreshStatusIfNeeded(event);
        }
    }

    private void refreshStatusIfNeeded(Event event) {
        String newStatus = event.calculateEventStatus();
        if (!Objects.equals(newStatus, event.getEventStatus())) {
            event.setEventStatus(newStatus);
            eventRepository.save(event);
        }
    }

    private void mapRequestToEvent(Event event, EventRequest request, User user) {
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setCity(request.getCity());
        event.setAddress(request.getAddress());
        event.setCategory(request.getCategory());

        LocalDateTime startTime = request.getStartTime() != null
                ? request.getStartTime()
                : request.getEventDate();

        event.setStartTime(startTime);
        event.setEventDate(startTime);
        event.setEndTime(request.getEndTime());

        event.setPrice(request.getPrice() != null ? request.getPrice() : 0.0);

        Boolean hasSeats = request.getHasSeats() != null ? request.getHasSeats() : false;
        event.setHasSeats(hasSeats);

        event.setSeatMapImageUrl(request.getSeatMapImageUrl());
        event.setVenueType(request.getVenueType());

        if (hasSeats) {
            Integer totalSeats = request.getTotalSeats() != null
                    ? request.getTotalSeats()
                    : request.getAvailableSeats();

            Integer availableSeats = request.getAvailableSeats() != null
                    ? request.getAvailableSeats()
                    : totalSeats;

            event.setTotalSeats(totalSeats);
            event.setAvailableSeats(availableSeats);
        } else {
            Integer quantity = request.getAvailableSeats() != null
                    ? request.getAvailableSeats()
                    : request.getTotalSeats();

            event.setTotalSeats(quantity);
            event.setAvailableSeats(quantity);
        }

        event.setRecurrenceType(
                request.getRecurrenceType() != null && !request.getRecurrenceType().isBlank()
                        ? request.getRecurrenceType()
                        : "NONE"
        );

        if (event.getCreatedBy() == null) {
            event.setCreatedBy(user.getEmail());
        }
    }

    private void validateEventRequest(EventRequest request) {
        if (request == null) {
            throw new RuntimeException("Event request cannot be null");
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("Event title is required");
        }

        LocalDateTime startTime = request.getStartTime() != null
                ? request.getStartTime()
                : request.getEventDate();

        if (startTime == null) {
            throw new RuntimeException("Event start time is required");
        }

        if (request.getEndTime() != null && request.getEndTime().isBefore(startTime)) {
            throw new RuntimeException("Event end time cannot be before start time");
        }

        if (request.getPrice() != null && request.getPrice() < 0) {
            throw new RuntimeException("Event price cannot be negative");
        }

        Boolean hasSeats = request.getHasSeats() != null ? request.getHasSeats() : false;

        if (hasSeats) {
            Integer totalSeats = request.getTotalSeats() != null
                    ? request.getTotalSeats()
                    : request.getAvailableSeats();

            if (totalSeats == null || totalSeats <= 0) {
                throw new RuntimeException("Seat-based events must have valid total seats");
            }

            if (request.getAvailableSeats() != null && request.getAvailableSeats() > totalSeats) {
                throw new RuntimeException("Available seats cannot be greater than total seats");
            }
        } else {
            Integer capacity = request.getAvailableSeats() != null
                    ? request.getAvailableSeats()
                    : request.getTotalSeats();

            if (capacity != null && capacity < 0) {
                throw new RuntimeException("Available seats/tickets cannot be negative");
            }
        }
    }

    private boolean isOrganizer(User user) {
        return user != null && (
                "ORGANIZER".equalsIgnoreCase(user.getRole()) ||
                        "ROLE_ORGANIZER".equalsIgnoreCase(user.getRole())
        );
    }

    private boolean isAdmin(User user) {
        return user != null && (
                "ADMIN".equalsIgnoreCase(user.getRole()) ||
                        "ROLE_ADMIN".equalsIgnoreCase(user.getRole())
        );
    }
}