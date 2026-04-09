import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { bookTicket, getBookingsByEventId } from "../services/bookingService";
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
  const [seatInput, setSeatInput] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [alreadyBookedSeats, setAlreadyBookedSeats] = useState([]);

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

  useEffect(() => {
    const loadBookedSeats = async () => {
      if (!requiresSeatSelection || !event?.eventId) return;

      try {
        const bookings = await getBookingsByEventId(event.eventId);
        const occupied = bookings
          .filter((booking) => booking.bookingStatus !== "CANCELLED")
          .flatMap((booking) => (booking.seatNumbers || "").split(","))
          .map((seat) => seat.trim().toUpperCase())
          .filter(Boolean);

        setAlreadyBookedSeats(Array.from(new Set(occupied)));
      } catch (error) {
        console.error("Failed to fetch booked seats", error);
      }
    };

    loadBookedSeats();
  }, [event?.eventId, requiresSeatSelection]);

  const selectedSeatsSet = useMemo(() => new Set(selectedSeats), [selectedSeats]);
  const alreadyBookedSeatsSet = useMemo(() => new Set(alreadyBookedSeats), [alreadyBookedSeats]);

  const addSeat = () => {
    const seatCode = seatInput.trim().toUpperCase();
    if (!seatCode) return;

    if (selectedSeatsSet.has(seatCode)) {
      alert("Seat already selected.");
      return;
    }

    if (alreadyBookedSeatsSet.has(seatCode)) {
      alert("This seat is already booked. Please select another seat.");
      return;
    }

    setSelectedSeats((prev) => [...prev, seatCode]);
    setSeatInput("");
  };

  const removeSeat = (seatCode) => {
    setSelectedSeats((prev) => prev.filter((seat) => seat !== seatCode));
  };

  const openPaymentModal = (e) => {
    e.preventDefault();

    if (!form.gender || !form.paymentMode) {
      alert("Please fill all details and select payment mode.");
      return;
    }

    if (requiresSeatSelection && selectedSeats.length === 0) {
      alert("Please select at least one seat for this event.");
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
        const payload = {
          eventId: Number(form.eventId),
          gender: form.gender,
          paymentMode: form.paymentMode,
        };

        if (requiresSeatSelection) {
          payload.seatNumbers = selectedSeats;
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
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          alert("Session expired or unauthorized access. Please login again and retry booking.");
          navigate("/user/login");
          return;
        }

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
              <div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    name="seatInput"
                    placeholder="Enter Seat Number (e.g. A1)"
                    value={seatInput}
                    onChange={(e) => setSeatInput(e.target.value)}
                  />
                  <button type="button" onClick={addSeat}>
                    Add Seat
                  </button>
                </div>

                <div className="subtext" style={{ marginTop: "8px" }}>
                  Already booked seats: {alreadyBookedSeats.length > 0 ? alreadyBookedSeats.join(", ") : "None"}
                </div>

                <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {selectedSeats.map((seat) => (
                    <button
                      key={seat}
                      type="button"
                      className="secondary"
                      onClick={() => removeSeat(seat)}
                    >
                      {seat} ×
                    </button>
                  ))}
                </div>
              </div>
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
                      selectedSeats.length * Number(event.price || 0)
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
