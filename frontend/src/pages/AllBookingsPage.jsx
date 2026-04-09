import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getAllBookings } from "../services/bookingService";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const formatAmount = (value) => Number(value || 0).toFixed(2);

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
            <p><strong>Booking Code:</strong> {booking.bookingCode || "N/A"}</p>
            <p><strong>Transaction Code:</strong> {booking.transactionCode || "N/A"}</p>
            <p><strong>User Email:</strong> {booking.user?.email}</p>
            <p><strong>Event Title:</strong> {booking.event?.title}</p>
            <p><strong>Quantity:</strong> {booking.quantity}</p>
            <p><strong>Total Amount:</strong> ₹{formatAmount(booking.totalAmount)}</p>
            <p><strong>Payment Mode:</strong> {booking.paymentMode}</p>
            <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
            <p><strong>Booking Status:</strong> {booking.bookingStatus || "CONFIRMED"}</p>
            <p><strong>Seats:</strong> {booking.seatNumbers || "N/A"}</p>
            <p><strong>Gender:</strong> {booking.gender}</p>
            <p><strong>Booking Time:</strong> {formatDateTime(booking.bookingTime)}</p>
            <p><strong>Confirmed At:</strong> {formatDateTime(booking.confirmedAt)}</p>
            <p><strong>Cancelled At:</strong> {formatDateTime(booking.cancelledAt)}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default AllBookingsPage;
