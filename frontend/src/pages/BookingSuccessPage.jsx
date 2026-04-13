import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const formatAmount = (value) => Number(value || 0).toFixed(2);

function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const individualBookings = Array.isArray(booking?.individualBookings)
    ? booking.individualBookings
    : [];
  const isMultiBooking = Boolean(booking?.isMultiBooking) || individualBookings.length > 1;
  const qrImageSources = [...new Set(
    [
      booking?.qrImagePath,
      ...(Array.isArray(booking?.qrImagePaths) ? booking.qrImagePaths : []),
      ...individualBookings.map((item) => item?.qrImagePath),
    ]
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
  )];

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

          <p><strong>Booking ID:</strong> {booking.bookingId || "N/A"}</p>
          <p><strong>Total Amount:</strong> ₹{formatAmount(booking.totalAmount)}</p>
          <p><strong>Seats:</strong> {booking.seatNumbers}</p>
          <p><strong>Payment Mode:</strong> {booking.paymentMode}</p>
          <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
          {isMultiBooking && (
            <p><strong>Bookings Created:</strong> {individualBookings.length}</p>
          )}

          <div className="qr-box">
            <p><strong>Your QR Ticket</strong></p>

            {qrImageSources.length > 0 ? (
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {qrImageSources.map((qrSource, index) => (
                  <img
                    key={`${qrSource}-${index}`}
                    src={qrSource}
                    alt={`QR Ticket ${index + 1}`}
                    style={{ width: "220px", height: "220px" }}
                  />
                ))}
              </div>
            ) : (
              <p>QR image not available.</p>
            )}
          </div>

          {isMultiBooking && (
            <div className="card" style={{ marginTop: "16px", textAlign: "left" }}>
              <h3 style={{ marginTop: 0 }}>Seat Booking Details</h3>
              {individualBookings.map((item) => (
                <p key={item.bookingId || `${item.seatNumbers}-${item.bookingCode}`}>
                  <strong>{item.seatNumbers || "Seat"}:</strong> Booking #{item.bookingId || "N/A"} (
                  ₹{formatAmount(item.totalAmount)})
                </p>
              ))}
            </div>
          )}

          <button onClick={() => navigate("/my-bookings")}>
            Go to My Bookings
          </button>
        </div>
      </div>
    </>
  );
}

export default BookingSuccessPage;
