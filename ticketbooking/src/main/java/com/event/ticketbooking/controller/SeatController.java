package com.event.ticketbooking.controller;

import com.event.ticketbooking.dto.SeatLayoutRequest;
import com.event.ticketbooking.dto.SeatViewResponse;
import com.event.ticketbooking.service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "*")
public class SeatController {

    @Autowired
    private SeatService seatService;

    @PostMapping("/layout/{eventId}")
    public String createSeatLayout(@PathVariable Long eventId, @RequestBody SeatLayoutRequest request, Principal principal) {
        return seatService.createSeatLayout(eventId, request, principal);
    }

    @GetMapping("/event/{eventId}/available")
    public List<String> getAvailableSeatsByEvent(@PathVariable Long eventId) {
        return seatService.getAvailableSeatsByEventId(eventId);
    }

    @GetMapping("/event/{eventId}")
    public List<SeatViewResponse> getSeatMapByEvent(@PathVariable Long eventId) {
        return seatService.getSeatMapByEventId(eventId);
    }
}
