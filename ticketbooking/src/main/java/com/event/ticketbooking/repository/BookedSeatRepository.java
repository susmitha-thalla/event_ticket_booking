package com.event.ticketbooking.repository;

import com.event.ticketbooking.model.BookedSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookedSeatRepository extends JpaRepository<BookedSeat, Long> {

    List<BookedSeat> findByBooking_BookingId(Long bookingId);

    List<BookedSeat> findByEvent_EventId(Long eventId);

    boolean existsByEvent_EventIdAndSeat_SeatId(Long eventId, Long seatId);

    boolean existsByEvent_EventIdAndSeatCode(Long eventId, String seatCode);
}