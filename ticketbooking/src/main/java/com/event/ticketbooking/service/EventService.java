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
import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    public Event createEvent(EventRequest request, Principal principal) {

        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"ORGANIZER".equalsIgnoreCase(user.getRole()) &&
                !"ROLE_ORGANIZER".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Only organizers can create events");
        }

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setCategory(request.getCategory());
        event.setEventDate(request.getEventDate());
        event.setPrice(request.getPrice());
        event.setAvailableSeats(request.getAvailableSeats());
        event.setCreatedBy(user.getEmail());
        event.setApprovalStatus("PENDING");
        event.setOrganizerPaid(true);

        // new upgrade fields
        event.setHasSeats(request.getHasSeats() != null ? request.getHasSeats() : false);
        event.setRecurrenceType(request.getRecurrenceType() != null ? request.getRecurrenceType() : "NONE");
        event.setEventStatus(calculateEventStatus(request.getEventDate()));
        event.setIsDeleted(false);

        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        refreshAllStatuses();
        return eventRepository.findByApprovalStatusAndIsDeletedFalse("APPROVED");
    }

    public List<Event> getByCategory(String category) {
        refreshAllStatuses();
        return eventRepository.findByCategoryAndApprovalStatusAndIsDeletedFalse(category, "APPROVED");
    }

    public List<Event> getByLocation(String location) {
        refreshAllStatuses();
        return eventRepository.findByLocationAndApprovalStatusAndIsDeletedFalse(location, "APPROVED");
    }

    public List<Event> getByCategoryAndLocation(String category, String location) {
        refreshAllStatuses();
        return eventRepository.findByCategoryAndLocationAndApprovalStatusAndIsDeletedFalse(
                category, location, "APPROVED"
        );
    }

    public List<Event> getByDateRange(LocalDateTime start, LocalDateTime end) {
        refreshAllStatuses();
        return eventRepository.findByEventDateBetweenAndApprovalStatusAndIsDeletedFalse(
                start, end, "APPROVED"
        );
    }

    public List<Event> getOrganizerEvents(Principal principal) {
        refreshAllStatuses();
        return eventRepository.findByCreatedByAndIsDeletedFalse(principal.getName());
    }

    public List<Event> getAllEventsForAdmin() {
        refreshAllStatuses();
        return eventRepository.findAll();
    }

    public String approveEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (Boolean.TRUE.equals(event.getIsDeleted())) {
            return "Cannot approve a deleted event";
        }

        event.setApprovalStatus("APPROVED");
        event.setEventStatus(calculateEventStatus(event.getEventDate()));
        eventRepository.save(event);

        return "Event Approved";
    }

    public List<Event> getLiveEvents() {
        refreshAllStatuses();
        return eventRepository.findByEventStatusAndIsDeletedFalse("LIVE")
                .stream()
                .filter(event -> "APPROVED".equalsIgnoreCase(event.getApprovalStatus()))
                .toList();
    }

    public List<Event> getStartingSoonEvents() {
        LocalDateTime now = LocalDateTime.now();
        refreshAllStatuses();
        return eventRepository.findByEventDateBetweenAndIsDeletedFalse(now, now.plusDays(2))
                .stream()
                .filter(event -> "APPROVED".equalsIgnoreCase(event.getApprovalStatus()))
                .toList();
    }

    public String softDeleteEvent(Long eventId, Principal principal) {
        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole()) ||
                "ROLE_ADMIN".equalsIgnoreCase(user.getRole());

        boolean isOwner = event.getCreatedBy() != null &&
                event.getCreatedBy().equalsIgnoreCase(email);

        if (!isAdmin && !isOwner) {
            return "You are not authorized to delete this event";
        }

        event.setIsDeleted(true);
        event.setEventStatus("DELETED");
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
        String newStatus = calculateEventStatus(event.getEventDate());
        if (!newStatus.equals(event.getEventStatus())) {
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
}
