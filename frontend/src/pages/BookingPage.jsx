import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { bookTicket } from "../services/bookingService";
import { getSeatMapByEvent } from "../services/seatService";
import Navbar from "../components/Navbar";

const formatAmount = (value) => Number(value || 0).toFixed(2);
const toBoolean = (value) => value === true || value === "true" || value === 1 || value === "1";

function BookingPage() {
  const locationHook = useLocation();
  const navigate = useNavigate();
  const event = locationHook.state?.event;
  const requiresSeatSelection = toBoolean(event?.hasSeats);

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
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatMap, setSeatMap] = useState([]);

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
    const loadSeatMap = async () => {
      if (!requiresSeatSelection || !event?.eventId) return;

      try {
        const seats = await getSeatMapByEvent(event.eventId);
        setSeatMap(seats || []);
      } catch (error) {
        console.error("Failed to fetch seat map", error);
      }
    };

    loadSeatMap();
  }, [event?.eventId, requiresSeatSelection]);

  const groupedSeats = useMemo(() => {
    const groups = {};
    for (const seat of seatMap) {
      const row = seat.rowLabel || "ROW";
      if (!groups[row]) groups[row] = [];
      groups[row].push(seat);
    }
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [seatMap]);

  const toggleSeatSelection = (seatCode) => {
    setSelectedSeats((previous) => {
      if (previous.includes(seatCode)) {
        return previous.filter((code) => code !== seatCode);
      }
      return [...previous, seatCode];
    });
  };

  const openPaymentModal = (e) => {
    e.preventDefault();

    const role = (localStorage.getItem("role") || "").toUpperCase();
    if (role !== "USER" && role !== "ROLE_USER") {
      alert("Please login with a USER account to book tickets.");
      navigate("/user/login");
      return;
    }

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
        const basePayload = {
          eventId: Number(form.eventId),
          gender: form.gender,
          paymentMode: form.paymentMode,
        };

        if (requiresSeatSelection) {
          if (selectedSeats.length === 1) {
            const singleSeatBooking = await bookTicket({
              ...basePayload,
              seatNumbers: [selectedSeats[0]],
              quantity: 1,
            });

            setProcessingPayment(false);
            setShowPaymentModal(false);
            navigate("/booking-success", { state: { booking: singleSeatBooking } });
            return;
          }

          const bookingResponses = [];
          for (const seatCode of selectedSeats) {
            const bookingResponse = await bookTicket({
              ...basePayload,
              seatNumbers: [seatCode],
              quantity: 1,
            });
            bookingResponses.push(bookingResponse);
          }

          setProcessingPayment(false);
          setShowPaymentModal(false);
          alert(`Booked ${bookingResponses.length} tickets successfully.`);
          navigate("/my-bookings");
          return;
        } else {
          const response = await bookTicket({
            ...basePayload,
            quantity: Number(form.quantity),
          });

          setProcessingPayment(false);
          setShowPaymentModal(false);
          navigate("/booking-success", { state: { booking: response } });
          return;
        }
      } catch (error) {
        setProcessingPayment(false);
        setShowPaymentModal(false);
        console.error(error);

        const status = error?.response?.status;
        const errorMessage = error?.message || "";
        const backendMessage =
          error?.response?.data?.message ||
          (typeof error?.response?.data === "string" ? error.response.data : "") ||
          error.message;

        const looksLikeAuthError =
          status === 401 ||
          status === 403 ||
          /status code 401/i.test(errorMessage) ||
          /status code 403/i.test(errorMessage) ||
          /forbidden/i.test(errorMessage) ||
          /unauthorized/i.test(errorMessage);

        if (looksLikeAuthError) {
          alert(`Authorization failed (${status}). Please login again and retry booking.`);
          navigate("/user/login");
          return;
        }

        alert(backendMessage || "Booking failed");
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
          <p><strong>Seat Selection:</strong> {requiresSeatSelection ? "Required (multiple seats allowed)" : "Not Required"}</p>

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
                <div className="subtext" style={{ marginBottom: "8px" }}>
                  Tap one or more available seats from the layout:
                </div>
                <div style={{ display: "grid", gap: "8px" }}>
                  {groupedSeats.map(([row, seats]) => (
                    <div key={row} style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <strong style={{ minWidth: "28px" }}>{row}</strong>
                      {seats.map((seat) => {
                        const isAvailable = seat.seatStatus === "AVAILABLE";
                        const isSelected = selectedSeats.includes(seat.seatCode);
                        return (
                          <button
                            key={seat.seatCode}
                            type="button"
                            disabled={!isAvailable}
                            className={isSelected ? "" : "secondary"}
                            style={{
                              minWidth: "56px",
                              opacity: isAvailable ? 1 : 0.45,
                              border: isSelected ? "2px solid #22c55e" : undefined,
                            }}
                            onClick={() => toggleSeatSelection(seat.seatCode)}
                          >
                            {seat.seatCode}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="subtext" style={{ marginTop: "8px" }}>
                  Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
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
                      Number(selectedSeats.length || 0) * Number(event.price || 0)
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
