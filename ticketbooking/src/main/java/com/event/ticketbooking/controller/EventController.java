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
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping("/create")
    public String createEvent(@RequestBody EventRequest request, Principal principal) {
        return eventService.createEvent(request, principal);
    }

    @PostMapping("/approve/{eventId}")
    public String approveEvent(@PathVariable Long eventId) {
        return eventService.approveEvent(eventId);
    }

    @GetMapping("/all")
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/my-events")
    public List<Event> getMyEvents(Principal principal) {
        return eventService.getOrganizerEvents(principal);
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
    public List<Event> filter(@RequestParam String category, @RequestParam String location) {
        return eventService.getByCategoryAndLocation(category, location);
    }

    @GetMapping("/date")
    public List<Event> getByDate(@RequestParam String start, @RequestParam String end) {
        return eventService.getByDateRange(LocalDateTime.parse(start), LocalDateTime.parse(end));
    }
    @GetMapping("/admin/all")
    public List<Event> getAllEventsForAdmin() {
        return eventService.getAllEventsForAdmin();
    }
}