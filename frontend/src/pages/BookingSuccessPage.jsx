import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card">
            <h2>No booking data</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div
          className="card"
          style={{ maxWidth: "650px", margin: "0 auto", textAlign: "center" }}
        >
          <h2 style={{ color: "green" }}>🎉 Booking Successful!</h2>

          <p><strong>Booking ID:</strong> {booking.bookingId}</p>
          <p><strong>Total Amount:</strong> ₹{booking.totalAmount}</p>
          <p><strong>Seats:</strong> {booking.seatNumbers}</p>
          <p><strong>Payment Mode:</strong> {booking.paymentMode}</p>
          <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>

          <div className="qr-box">
            <p><strong>Your QR Ticket</strong></p>

            {booking.qrImagePath && booking.qrImagePath.startsWith("data:image") ? (
  <img
    src={booking.qrImagePath}
    alt="QR Ticket"
    style={{ width: "220px", height: "220px", marginTop: "10px" }}
  />
) : (
  <p>QR image not available</p>
)}
          </div>

          <button onClick={() => navigate("/my-bookings")}>
            Go to My Bookings
          </button>
        </div>
      </div>
    </>
  );
}

export default BookingSuccessPage;