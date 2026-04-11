import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings } from "../services/bookingService";
import Navbar from "../components/Navbar";

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

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getMyBookings();
        const bookingList = getArrayFromPayload(data, ["bookings", "content", "items", "results"]);
        setBookings(bookingList);
      } catch (error) {
        console.error(error);
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          setErrorMessage("Session expired. Please login again.");
          navigate("/user/login");
          return;
        }

        setErrorMessage("Failed to load bookings right now. Please try again.");
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
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">
            Review your tickets, payments, and QR verification details.
          </p>
        </div>

        {errorMessage && <div className="message-error">{errorMessage}</div>}

        {loading ? (
          <div className="card empty-state">
            <h3>Loading bookings...</h3>
            <p>Fetching your latest tickets.</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card empty-state">
            <h3>No bookings yet</h3>
            <p>Your booked tickets will appear here.</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => {
            const hasValidQr =
              booking.qrImagePath &&
              typeof booking.qrImagePath === "string" &&
              booking.qrImagePath.startsWith("data:image");

            return (
              <div className="booking-ticket-card" key={booking.bookingId}>
                <div className="booking-ticket-head">
                  <div className="card-title">Booking #{booking.bookingId}</div>
                  <span className={`badge ${booking.paymentStatus === "SUCCESS" ? "approved" : "pending"}`}>
                    {booking.paymentStatus || "PENDING"}
                  </span>
                </div>

                <div className="info-row">
                  <strong>Quantity:</strong> {booking.quantity}
                </div>
                <div className="info-row">
                  <strong>Total Amount:</strong> ₹{booking.totalAmount}
                </div>
                <div className="info-row">
                  <strong>Payment Mode:</strong> {booking.paymentMode}
                </div>
                <div className="info-row">
                  <strong>Seat Numbers:</strong> {booking.seatNumbers}
                </div>
                <div className="info-row">
                  <strong>Gender:</strong> {booking.gender}
                </div>

                <div className="qr-box">
                  <strong>QR Ticket Image</strong>

                  {hasValidQr ? (
                    <img
                      src={booking.qrImagePath}
                      alt="QR Code"
                      className="qr-image booking-qr-image"
                    />
                  ) : (
                    <p style={{ marginTop: "10px" }}>QR image not available.</p>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </>
  );
}

export default MyBookingsPage;
