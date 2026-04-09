package com.event.ticketbooking.controller;

import com.event.ticketbooking.dto.EventRequest;
import com.event.ticketbooking.model.Event;
import com.event.ticketbooking.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventService eventService;

    // =========================
    // ORGANIZER
    // =========================

    @PostMapping("/create")
    public String createEvent(@RequestBody EventRequest request, Principal principal) {
        return eventService.createEvent(request, principal);
    }

    @PutMapping("/{eventId}")
    public String updateEvent(@PathVariable Long eventId,
                              @RequestBody EventRequest request,
                              Principal principal) {
        return eventService.updateEvent(eventId, request, principal);
    }

    @GetMapping("/my-events")
    public List<Event> getMyEvents(Principal principal) {
        return eventService.getOrganizerEvents(principal);
    }

    @GetMapping("/my-events/approved")
    public List<Event> getMyApprovedEvents(Principal principal) {
        return eventService.getOrganizerApprovedEvents(principal);
    }

    @GetMapping("/my-events/pending")
    public List<Event> getMyPendingEvents(Principal principal) {
        return eventService.getOrganizerPendingEvents(principal);
    }

    // =========================
    // ADMIN
    // =========================

    @PutMapping("/approve/{eventId}")
    public String approveEvent(@PathVariable Long eventId) {
        return eventService.approveEvent(eventId);
    }

    @PutMapping("/reject/{eventId}")
    public String rejectEvent(@PathVariable Long eventId) {
        return eventService.rejectEvent(eventId);
    }

    @GetMapping("/admin/all")
    public List<Event> getAllEventsForAdmin() {
        return eventService.getAllEventsForAdmin();
    }

    @GetMapping("/admin/pending")
    public List<Event> getPendingEventsForAdmin() {
        return eventService.getPendingEventsForAdmin();
    }

    // =========================
    // PUBLIC EVENT LISTING
    // =========================

    @GetMapping("/all")
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{eventId}")
    public Event getEventById(@PathVariable Long eventId) {
        return eventService.getEventById(eventId);
    }

    @GetMapping("/category/{category}")
    public List<Event> getByCategory(@PathVariable String category) {
        return eventService.getByCategory(category);
    }

    @GetMapping("/location/{location}")
    public List<Event> getByLocation(@PathVariable String location) {
        return eventService.getByLocation(location);
    }

    @GetMapping("/filter")
    public List<Event> filter(@RequestParam String category,
                              @RequestParam String location) {
        return eventService.getByCategoryAndLocation(category, location);
    }

    @GetMapping("/date")
    public List<Event> getByDate(@RequestParam String start,
                                 @RequestParam String end) {
        return eventService.getByDateRange(
                LocalDateTime.parse(start),
                LocalDateTime.parse(end)
        );
    }

    // =========================
    // EVENT STATUS FILTERS
    // =========================

    @GetMapping("/live")
    public List<Event> getLiveEvents() {
        return eventService.getLiveEvents();
    }

    @GetMapping("/upcoming")
    public List<Event> getUpcomingEvents() {
        return eventService.getUpcomingEvents();
    }

    @GetMapping("/completed")
    public List<Event> getCompletedEvents() {
        return eventService.getCompletedEvents();
    }

    @GetMapping("/starting-soon")
    public List<Event> getStartingSoonEvents() {
        return eventService.getStartingSoonEvents();
    }

    // =========================
    // SEAT FILTERS
    // =========================

    @GetMapping("/seat-based")
    public List<Event> getSeatBasedEvents() {
        return eventService.getSeatBasedEvents();
    }

    @GetMapping("/non-seat-based")
    public List<Event> getNonSeatBasedEvents() {
        return eventService.getNonSeatBasedEvents();
    }

    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{eventId}")
    public String deleteEvent(@PathVariable Long eventId, Principal principal) {
        return eventService.softDeleteEvent(eventId, principal);
    }
}