import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { bookTicket } from "../services/bookingService";
import Navbar from "../components/Navbar";

const formatAmount = (value) => Number(value || 0).toFixed(2);

function BookingPage() {
  const locationHook = useLocation();
  const navigate = useNavigate();
  const event = locationHook.state?.event;
  const requiresSeatSelection = Boolean(event?.hasSeats);

  const [form, setForm] = useState({
    eventId: event?.eventId || "",
    quantity: "",
    paymentMode: "",
    seatNumbers: "",
    gender: "",
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedApp, setSelectedApp] = useState("");

  if (!event) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="card">
            <h2>No event selected</h2>
          </div>
        </div>
      </>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openPaymentModal = (e) => {
    e.preventDefault();

    if (!form.gender || !form.paymentMode) {
      alert("Please fill all details and select payment mode.");
      return;
    }

    if (requiresSeatSelection && !form.seatNumbers.trim()) {
      alert("Please enter seat numbers for this event.");
      return;
    }

    if (!requiresSeatSelection && (!form.quantity || Number(form.quantity) <= 0)) {
      alert("Please enter a valid ticket quantity.");
      return;
    }

    setShowPaymentModal(true);
  };

  const handleFakePayment = async (appName) => {
    setSelectedApp(appName);
    setProcessingPayment(true);

    setTimeout(async () => {
      try {
        const parsedSeatNumbers = form.seatNumbers
          .split(",")
          .map((seat) => seat.trim().toUpperCase())
          .filter(Boolean);

        const payload = {
          eventId: Number(form.eventId),
          gender: form.gender,
          paymentMode: form.paymentMode,
        };

        if (requiresSeatSelection) {
          payload.seatNumbers = parsedSeatNumbers;
        } else {
          payload.quantity = Number(form.quantity);
        }

        const response = await bookTicket({
          ...payload,
        });

        setProcessingPayment(false);
        setShowPaymentModal(false);

        navigate("/booking-success", { state: { booking: response } });
      } catch (error) {
        setProcessingPayment(false);
        setShowPaymentModal(false);
        console.error(error);
        alert(error.response?.data?.message || error.response?.data || error.message || "Booking failed");
      }
    }, 2000);
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <div className="card" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2>Book Event</h2>

          <p><strong>{event.title}</strong></p>
          <p className="subtext">{event.location} • {event.category}</p>
          <p><strong>Price per ticket:</strong> ₹{formatAmount(event.price)}</p>
          <p><strong>Seat Selection:</strong> {requiresSeatSelection ? "Required" : "Not Required"}</p>

          <form onSubmit={openPaymentModal}>
            {!requiresSeatSelection && (
              <input
                name="quantity"
                type="number"
                min="1"
                placeholder="No. of Tickets"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            )}

            {requiresSeatSelection && (
              <input
                name="seatNumbers"
                placeholder="Seat numbers (A1,A2)"
                value={form.seatNumbers}
                onChange={handleChange}
                required
              />
            )}

            <select
              name="gender"
              placeholder="Gender"
              value={form.gender}
              onChange={handleChange}
              required
              >
              <option value="">Select Gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
              </select>
          

            <select
              name="paymentMode"
              value={form.paymentMode}
              onChange={handleChange}
              required
            >
              <option value="">Select Payment Mode</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="NETBANKING">Net Banking</option>
              <option value="CASH">Cash</option>
            </select>

            <button type="submit">Pay Now</button>
          </form>
        </div>
      </div>

      {showPaymentModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div className="card" style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
            <h2>Secure Payment</h2>
            <p>
              <strong>Amount:</strong> ₹{
                requiresSeatSelection
                  ? formatAmount(
                      form.seatNumbers
                        .split(",")
                        .map((seat) => seat.trim())
                        .filter(Boolean).length * Number(event.price || 0)
                    )
                  : formatAmount(Number(form.quantity || 0) * Number(event.price || 0))
              }
            </p>
            <p><strong>Payment Mode:</strong> {form.paymentMode}</p>

            {!processingPayment && form.paymentMode === "UPI" && (
              <>
                <p style={{ marginTop: "10px" }}><strong>Select UPI App</strong></p>

                <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
                  <button type="button" onClick={() => handleFakePayment("Google Pay")}>
                    📱 Google Pay
                  </button>
                  <button type="button" onClick={() => handleFakePayment("PhonePe")}>
                    📱 PhonePe
                  </button>
                  <button type="button" onClick={() => handleFakePayment("Paytm")}>
                    📱 Paytm
                  </button>
                </div>
              </>
            )}

            {!processingPayment && form.paymentMode === "CARD" && (
              <>
                <p style={{ marginTop: "10px" }}><strong>Card Payment</strong></p>
                <button type="button" onClick={() => handleFakePayment("Card")}>
                  💳 Pay with Card
                </button>
              </>
            )}

            {!processingPayment && (form.paymentMode === "NETBANKING" || form.paymentMode === "CASH") && (
              <button type="button" onClick={() => handleFakePayment(form.paymentMode)}>
                Continue
              </button>
            )}

            {!processingPayment && (
              <button
                type="button"
                className="danger"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
            )}

            {processingPayment && (
              <div style={{ marginTop: "15px" }}>
                <h3>Opening {selectedApp}...</h3>
                <p>Processing payment...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default BookingPage;
