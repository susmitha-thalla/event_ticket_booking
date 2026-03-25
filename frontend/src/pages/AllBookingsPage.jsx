import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAllBookings } from "../services/bookingService";

function AllBookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await getAllBookings();
        setBookings(data);
      } catch (error) {
        console.error(error);
        alert("Failed to load all bookings");
      }
    };

    loadBookings();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>All Bookings</h2>

        {bookings.map((booking) => (
          <div className="card" key={booking.bookingId}>
            <p><strong>Booking ID:</strong> {booking.bookingId}</p>
            <p><strong>User Email:</strong> {booking.user?.email}</p>
            <p><strong>Event Title:</strong> {booking.event?.title}</p>
            <p><strong>Quantity:</strong> {booking.quantity}</p>
            <p><strong>Total Amount:</strong> ₹{booking.totalAmount}</p>
            <p><strong>Payment Mode:</strong> {booking.paymentMode}</p>
            <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
            <p><strong>Seats:</strong> {booking.seatNumbers}</p>
            <p><strong>Gender:</strong> {booking.gender}</p>
            <p><strong>Booking Time:</strong> {booking.bookingTime}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default AllBookingsPage;