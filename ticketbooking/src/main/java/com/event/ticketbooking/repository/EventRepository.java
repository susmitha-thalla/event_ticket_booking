package com.event.ticketbooking.repository;

import com.event.ticketbooking.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // =========================
    // BASIC SAFE FETCHES
    // =========================

    List<Event> findByIsDeletedFalse();

    Optional<Event> findByEventIdAndIsDeletedFalse(Long eventId);

    Optional<Event> findByEventCodeAndIsDeletedFalse(String eventCode);

    boolean existsByEventCode(String eventCode);

    // =========================
    // APPROVAL STATUS
    // =========================

    List<Event> findByApprovalStatusAndIsDeletedFalse(String approvalStatus);

    List<Event> findByApprovalStatusAndEventStatusAndIsDeletedFalse(String approvalStatus, String eventStatus);

    // =========================
    // ORGANIZER EVENTS
    // =========================

    List<Event> findByCreatedByAndIsDeletedFalse(String createdBy);

    List<Event> findByCreatedByAndApprovalStatusAndIsDeletedFalse(String createdBy, String approvalStatus);

    List<Event> findByCreatedByAndEventStatusAndIsDeletedFalse(String createdBy, String eventStatus);

    List<Event> findByCreatedByAndApprovalStatusAndEventStatusAndIsDeletedFalse(
            String createdBy,
            String approvalStatus,
            String eventStatus
    );

    // =========================
    // CATEGORY / LOCATION FILTERS
    // =========================

    List<Event> findByCategoryAndApprovalStatusAndIsDeletedFalse(String category, String approvalStatus);

    List<Event> findByLocationAndApprovalStatusAndIsDeletedFalse(String location, String approvalStatus);

    List<Event> findByCityAndApprovalStatusAndIsDeletedFalse(String city, String approvalStatus);

    List<Event> findByCategoryAndLocationAndApprovalStatusAndIsDeletedFalse(
            String category,
            String location,
            String approvalStatus
    );

    List<Event> findByCategoryAndCityAndApprovalStatusAndIsDeletedFalse(
            String category,
            String city,
            String approvalStatus
    );

    // =========================
    // DATE / TIME FILTERS
    // =========================

    // Backward compatibility with old eventDate field
    List<Event> findByEventDateBetweenAndApprovalStatusAndIsDeletedFalse(
            LocalDateTime start,
            LocalDateTime end,
            String approvalStatus
    );

    List<Event> findByEventDateBetweenAndIsDeletedFalse(
            LocalDateTime start,
            LocalDateTime end
    );

    // Recommended new logic using startTime
    List<Event> findByStartTimeBetweenAndApprovalStatusAndIsDeletedFalse(
            LocalDateTime start,
            LocalDateTime end,
            String approvalStatus
    );

    List<Event> findByStartTimeBetweenAndIsDeletedFalse(
            LocalDateTime start,
            LocalDateTime end
    );

    List<Event> findByStartTimeAfterAndApprovalStatusAndIsDeletedFalse(
            LocalDateTime dateTime,
            String approvalStatus
    );

    List<Event> findByStartTimeBeforeAndApprovalStatusAndIsDeletedFalse(
            LocalDateTime dateTime,
            String approvalStatus
    );

    // =========================
    // EVENT STATUS
    // =========================

    List<Event> findByEventStatusAndIsDeletedFalse(String eventStatus);

    List<Event> findByEventStatusAndApprovalStatusAndIsDeletedFalse(
            String eventStatus,
            String approvalStatus
    );

    // =========================
    // SEAT-BASED / NON-SEAT EVENTS
    // =========================

    List<Event> findByHasSeatsAndIsDeletedFalse(Boolean hasSeats);

    List<Event> findByHasSeatsAndApprovalStatusAndIsDeletedFalse(
            Boolean hasSeats,
            String approvalStatus
    );

    // =========================
    // ADMIN DASHBOARD / COUNTS
    // =========================

    long countByIsDeletedFalse();

    long countByApprovalStatusAndIsDeletedFalse(String approvalStatus);

    long countByEventStatusAndIsDeletedFalse(String eventStatus);

    long countByCreatedByAndIsDeletedFalse(String createdBy);

    // =========================
    // OPTIONAL EXTRA FILTERS
    // =========================

    List<Event> findByVenueTypeAndApprovalStatusAndIsDeletedFalse(String venueType, String approvalStatus);

    List<Event> findByRecurrenceTypeAndApprovalStatusAndIsDeletedFalse(String recurrenceType, String approvalStatus);
}