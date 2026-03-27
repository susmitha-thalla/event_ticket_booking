import { useEffect, useState } from "react";
import { getMyBookings } from "../services/bookingService";
import Navbar from "../components/Navbar";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await getMyBookings();
        console.log("Bookings data:", data);
        setBookings(data);
      } catch (error) {
        console.error(error);
        alert("Failed to load bookings");
      }
    };

    loadBookings();
  }, []);

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

        {bookings.length === 0 ? (
          <div className="card empty-state">
            <h3>No bookings yet</h3>
            <p>Your booked tickets will appear here.</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const hasValidQr =
              booking.qrImagePath &&
              typeof booking.qrImagePath === "string" &&
              booking.qrImagePath.startsWith("data:image");

            return (
              <div className="card" key={booking.bookingId}>
                <div className="card-title">Booking #{booking.bookingId}</div>

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
                  <strong>Payment Status:</strong> {booking.paymentStatus}
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
                      className="qr-image"
                      style={{ width: "220px", height: "220px", marginTop: "10px" }}
                    />
                  ) : (
                    <p style={{ marginTop: "10px" }}>QR image not available.</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default MyBookingsPage;