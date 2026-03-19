package com.event.ticketbooking.service;

import com.event.ticketbooking.dto.EventRequest;
import com.event.ticketbooking.model.Event;
import com.event.ticketbooking.model.User;
import com.event.ticketbooking.repository.EventRepository;
import com.event.ticketbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    // ✅ CREATE EVENT (ONLY ORGANIZER)
    public String createEvent(EventRequest request) {

        User user = userRepository.findByEmail(request.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔥 ROLE CHECK
        if (!user.getRole().equals("ORGANIZER")) {
            return "Only organizers can create events!";
        }

        Event event = new Event();

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setPrice(request.getPrice());
        event.setAvailableSeats(request.getAvailableSeats());
        event.setCreatedBy(user.getEmail());

        eventRepository.save(event);

        return "Event Created Successfully";
    }

    // ✅ GET ALL EVENTS
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
    public List<Event> getByCategory(String category) {
        return eventRepository.findByCategory(category);
    }

    public List<Event> getByLocation(String location) {
        return eventRepository.findByLocation(location);
    }

    public List<Event> getByCategoryAndLocation(String category, String location) {
        return eventRepository.findByCategoryAndLocation(category, location);
    }
}