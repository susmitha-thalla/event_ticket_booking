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

    public String createEvent(EventRequest request, Principal principal) {

        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"ORGANIZER".equals(user.getRole())) {
            return "Only organizers can create events!";
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

        eventRepository.save(event);

        return "Event Created Successfully and sent for admin approval";
    }

    public List<Event> getAllEvents() {
        return eventRepository.findByApprovalStatus("APPROVED");
    }

    public List<Event> getByCategory(String category) {
        return eventRepository.findByCategoryAndApprovalStatus(category, "APPROVED");
    }

    public List<Event> getByLocation(String location) {
        return eventRepository.findByLocationAndApprovalStatus(location, "APPROVED");
    }

    public List<Event> getByCategoryAndLocation(String category, String location) {
        return eventRepository.findByCategoryAndLocationAndApprovalStatus(category, location, "APPROVED");
    }

    public List<Event> getByDateRange(LocalDateTime start, LocalDateTime end) {
        return eventRepository.findByEventDateBetweenAndApprovalStatus(start, end, "APPROVED");
    }

    public List<Event> getOrganizerEvents(Principal principal) {
        return eventRepository.findByCreatedBy(principal.getName());
    }
    public List<Event> getAllEventsForAdmin() {
        return eventRepository.findAll();
    }

    public String approveEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setApprovalStatus("APPROVED");
        eventRepository.save(event);

        return "Event Approved";
    }
}