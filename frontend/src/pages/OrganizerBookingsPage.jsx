import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrganizerBookings } from "../services/bookingService";

function OrganizerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getOrganizerBookings();
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          setErrorMessage("Organizer session expired or unauthorized. Please login again.");
          navigate("/organizer/login");
          return;
        }
        setErrorMessage("Failed to load organizer bookings.");
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
        <h2>Bookings On My Events</h2>
        {errorMessage && <div className="message-error">{errorMessage}</div>}

        {loading ? (
          <div className="card empty-state">
            <h3>Loading organizer bookings...</h3>
            <p>Please wait.</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card empty-state">
            <h3>No bookings on your events yet</h3>
            <p>Bookings will appear here once users reserve tickets.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div className="card" key={booking.bookingId || booking.id}>
              <p><strong>Booking ID:</strong> {booking.bookingId || booking.id || "N/A"}</p>
              <p><strong>User Email:</strong> {booking.user?.email || booking.userEmail || booking.email || "N/A"}</p>
              <p><strong>Event Title:</strong> {booking.event?.title || booking.eventTitle || booking.title || "N/A"}</p>
              <p><strong>Quantity:</strong> {booking.quantity || 0}</p>
              <p><strong>Total Amount:</strong> ₹{booking.totalAmount || 0}</p>
              <p><strong>Seats:</strong> {booking.seatNumbers || "N/A"}</p>
              <p><strong>Gender:</strong> {booking.gender || "N/A"}</p>
              <p><strong>Payment Mode:</strong> {booking.paymentMode || "N/A"}</p>
              <p><strong>Payment Status:</strong> {booking.paymentStatus || booking.status || "PENDING"}</p>
              <p><strong>Booking Status:</strong> {booking.bookingStatus || "CONFIRMED"}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default OrganizerBookingsPage;
