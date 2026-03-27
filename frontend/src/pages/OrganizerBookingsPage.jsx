import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getOrganizerBookings } from "../services/bookingService";

function OrganizerBookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await getOrganizerBookings();
        setBookings(data);
      } catch (error) {
        console.error(error);
        alert("😞Failed to load organizer bookings");
      }
    };

    loadBookings();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Bookings On My Events</h2>

        {bookings.map((booking) => (
          <div className="card" key={booking.bookingId}>
            <p><strong>Booking ID:</strong> {booking.bookingId}</p>
            <p><strong>User Email:</strong> {booking.user?.email}</p>
            <p><strong>Event Title:</strong> {booking.event?.title}</p>
            <p><strong>Quantity:</strong> {booking.quantity}</p>
            <p><strong>Total Amount:</strong> ₹{booking.totalAmount}</p>
            <p><strong>Seats:</strong> {booking.seatNumbers}</p>
            <p><strong>Gender:</strong> {booking.gender}</p>
            <p><strong>Payment Mode:</strong> {booking.paymentMode}</p>
            <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default OrganizerBookingsPage;