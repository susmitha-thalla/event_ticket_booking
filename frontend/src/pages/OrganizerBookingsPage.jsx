import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrganizerBookings } from "../services/bookingService";

const formatAmount = (value) => Number(value || 0).toFixed(2);

const resolveQuantity = (booking) => {
  const quantity = Number(booking?.quantity);
  if (Number.isFinite(quantity) && quantity > 0) return quantity;

  if (typeof booking?.seatNumbers === "string") {
    const seats = booking.seatNumbers
      .split(",")
      .map((seat) => seat.trim())
      .filter((seat) => seat && seat.toUpperCase() !== "N/A");
    return seats.length;
  }

  return 0;
};

function OrganizerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const bookingsSummaryByEvent = useMemo(() => {
    const eventMap = new Map();

    for (const booking of bookings) {
      const eventId = booking?.event?.eventId ?? booking?.eventId ?? "unknown";
      const eventTitle = booking?.event?.title || booking?.eventTitle || booking?.title || "Untitled Event";
      const quantity = resolveQuantity(booking);
      const amount = Number(booking?.totalAmount);
      const totalAmount = Number.isFinite(amount) ? amount : 0;

      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          eventId,
          eventTitle,
          totalBookings: 0,
          totalSeats: 0,
          totalAmount: 0,
        });
      }

      const current = eventMap.get(eventId);
      current.totalBookings += 1;
      current.totalSeats += quantity;
      current.totalAmount += totalAmount;
    }

    return Array.from(eventMap.values()).sort((a, b) => b.totalBookings - a.totalBookings);
  }, [bookings]);

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
          <>
            <h3>Bookings Per Event</h3>
            <div className="grid-3" style={{ marginBottom: "20px" }}>
              {bookingsSummaryByEvent.map((summary) => (
                <div className="stat-box" key={summary.eventId}>
                  <div className="stat-value">{summary.totalBookings}</div>
                  <div className="stat-label">{summary.eventTitle}</div>
                  <div className="subtext">Seats: {summary.totalSeats}</div>
                  <div className="subtext">Revenue: ₹{formatAmount(summary.totalAmount)}</div>
                </div>
              ))}
            </div>

            <h3>All Booking Records</h3>
            {bookings.map((booking) => (
              <div className="card" key={booking.bookingId || booking.id}>
                <p><strong>Booking ID:</strong> {booking.bookingId || booking.id || "N/A"}</p>
                <p><strong>User Email:</strong> {booking.user?.email || booking.userEmail || booking.email || "N/A"}</p>
                <p><strong>Event Title:</strong> {booking.event?.title || booking.eventTitle || booking.title || "N/A"}</p>
                <p><strong>Quantity:</strong> {resolveQuantity(booking)}</p>
                <p><strong>Total Amount:</strong> ₹{formatAmount(booking.totalAmount)}</p>
                <p><strong>Seats:</strong> {booking.seatNumbers || "N/A"}</p>
                <p><strong>Gender:</strong> {booking.gender || "N/A"}</p>
                <p><strong>Payment Mode:</strong> {booking.paymentMode || "N/A"}</p>
                <p><strong>Payment Status:</strong> {booking.paymentStatus || booking.status || "PENDING"}</p>
                <p><strong>Booking Status:</strong> {booking.bookingStatus || "CONFIRMED"}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default OrganizerBookingsPage;
