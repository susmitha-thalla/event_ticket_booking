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

const getArrayFromPayload = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && typeof payload.data === "object") {
    for (const key of keys) {
      if (Array.isArray(payload.data[key])) return payload.data[key];
    }
  }

  return [];
};

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
        const bookingList = getArrayFromPayload(data, ["bookings", "content", "items", "results"]);
        setBookings(bookingList);
      } catch (error) {
        console.error(error);
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          setErrorMessage("Admin session expired or unauthorized. Please login again.");
          navigate("/admin/login");
          return;
        }

        setErrorMessage("Failed to load all bookings.");
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
          ))
        )}
      </div>
    </>
  );
}

export default AllBookingsPage;
