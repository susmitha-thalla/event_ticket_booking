package com.event.ticketbooking.controller;

import com.event.ticketbooking.dto.EventRequest;
import com.event.ticketbooking.model.Event;
import com.event.ticketbooking.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    // ✅ CREATE EVENT
    @PostMapping("/create")
    public String createEvent(@RequestBody EventRequest request) {
        return eventService.createEvent(request);
    }

    // ✅ VIEW EVENTS
    @GetMapping("/all")
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }
}