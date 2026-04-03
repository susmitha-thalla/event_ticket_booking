package com.event.ticketbooking.repository;

import com.event.ticketbooking.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    // old logic + ignore deleted events
    List<Event> findByApprovalStatusAndIsDeletedFalse(String status);

    List<Event> findByCreatedByAndIsDeletedFalse(String email);

    List<Event> findByCategoryAndApprovalStatusAndIsDeletedFalse(String category, String status);

    List<Event> findByLocationAndApprovalStatusAndIsDeletedFalse(String location, String status);

    List<Event> findByCategoryAndLocationAndApprovalStatusAndIsDeletedFalse(
            String category,
            String location,
            String status
    );

    List<Event> findByEventDateBetweenAndApprovalStatusAndIsDeletedFalse(
            LocalDateTime start,
            LocalDateTime end,
            String status
    );

    // new upgrade queries
    List<Event> findByIsDeletedFalse();

    List<Event> findByEventStatusAndIsDeletedFalse(String eventStatus);

    List<Event> findByEventDateBetweenAndIsDeletedFalse(LocalDateTime start, LocalDateTime end);

    Optional<Event> findByEventIdAndIsDeletedFalse(Long eventId);
}