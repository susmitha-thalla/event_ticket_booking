import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getAllBookings();
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          setErrorMessage("Admin session expired or unauthorized. Please login again.");
          navigate("/admin/login");
          return;
        }

        setErrorMessage("");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>All Bookings</h2>

        {errorMessage && <div className="message-error">{errorMessage}</div>}

        {loading ? (
          <div className="card empty-state">
            <h3>Loading bookings...</h3>
            <p>Please wait.</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card empty-state">
            <h3>No bookings available</h3>
            <p>Bookings will appear here once users start booking events.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div className="card" key={booking.bookingId || booking.id}>
              <p><strong>Booking ID:</strong> {booking.bookingId || booking.id || "N/A"}</p>
              <p><strong>Booking Code:</strong> {booking.bookingCode || "N/A"}</p>
              <p><strong>Transaction Code:</strong> {booking.transactionCode || "N/A"}</p>
              <p><strong>User Email:</strong> {booking.user?.email || booking.userEmail || booking.email || "N/A"}</p>
              <p><strong>Event Title:</strong> {booking.event?.title || booking.eventTitle || booking.title || "N/A"}</p>
              <p><strong>Quantity:</strong> {booking.quantity || 0}</p>
              <p><strong>Total Amount:</strong> ₹{formatAmount(booking.totalAmount)}</p>
              <p><strong>Payment Mode:</strong> {booking.paymentMode || "N/A"}</p>
              <p><strong>Payment Status:</strong> {booking.paymentStatus || booking.status || "PENDING"}</p>
              <p><strong>Booking Status:</strong> {booking.bookingStatus || "CONFIRMED"}</p>
              <p><strong>Seats:</strong> {booking.seatNumbers || "N/A"}</p>
              <p><strong>Gender:</strong> {booking.gender || "N/A"}</p>
              <p><strong>Booking Time:</strong> {formatDateTime(booking.bookingTime || booking.createdAt)}</p>
              <p><strong>Confirmed At:</strong> {formatDateTime(booking.confirmedAt)}</p>
              <p><strong>Cancelled At:</strong> {formatDateTime(booking.cancelledAt)}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default AllBookingsPage;
