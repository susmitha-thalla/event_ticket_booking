package com.event.ticketbooking.repository;

import com.event.ticketbooking.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByCategory(String category);

    List<Event> findByLocation(String location);

    List<Event> findByCategoryAndLocation(String category, String location);
}