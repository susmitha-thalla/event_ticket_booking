package com.event.ticketbooking.repository;

import com.event.ticketbooking.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByEvent_EventIdAndIsDeletedFalse(Long eventId);

    List<Seat> findByEvent_EventIdAndSeatStatusAndIsDeletedFalse(Long eventId, String seatStatus);

    Optional<Seat> findByEvent_EventIdAndSeatCodeAndIsDeletedFalse(Long eventId, String seatCode);

    boolean existsByEvent_EventIdAndSeatCodeAndIsDeletedFalse(Long eventId, String seatCode);

    long countByEvent_EventIdAndIsDeletedFalse(Long eventId);

    long countByEvent_EventIdAndSeatStatusAndIsDeletedFalse(Long eventId, String seatStatus);
}