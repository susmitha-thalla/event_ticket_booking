import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createEvent } from "../services/eventService";

function CreateEventPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    eventDate: "",
    price: "",
    availableSeats: "",
    hasSeats: false,
    recurrenceType: "NONE",
  });
  const [seatLayout, setSeatLayout] = useState("");

  const parsedUniqueSeats = useMemo(() => {
    if (!form.hasSeats) return [];
    const seats = seatLayout
      .split(/[\n,]+/)
      .map((seat) => seat.trim().toUpperCase())
      .filter(Boolean);

    return Array.from(new Set(seats));
  }, [seatLayout, form.hasSeats]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (form.hasSeats && parsedUniqueSeats.length === 0) {
      alert("Please enter seat layout for a seat-based event.");
      return;
    }

    const availableSeats = form.hasSeats
      ? parsedUniqueSeats.length
      : Number(form.availableSeats);

    if (!availableSeats || Number(availableSeats) <= 0) {
      alert("Available seats must be greater than 0.");
      return;
    }

    try {
      const response = await createEvent({
        title: form.title,
        description: form.description,
        location: form.location,
        category: form.category,
        eventDate: form.eventDate,
        price: Number(form.price),
        availableSeats,
        hasSeats: Boolean(form.hasSeats),
        recurrenceType: form.recurrenceType || "NONE",
      });
      alert(response);

      setForm({
        title: "",
        description: "",
        location: "",
        category: "",
        eventDate: "",
        price: "",
        availableSeats: "",
        hasSeats: false,
        recurrenceType: "NONE",
      });
      setSeatLayout("");
    } catch (error) {
      console.error(error);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        alert("Unauthorized. Please login again as organizer.");
        navigate("/organizer/login");
        return;
      }
      alert(error.response?.data || error.message || "Event creation failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2>Create Event</h2>
          <form onSubmit={handleCreate}>
            <input name="title" placeholder="Title" onChange={handleChange} required />
            <input name="description" placeholder="Description" onChange={handleChange} required />
            <input name="location" placeholder="Location" onChange={handleChange} required />
            <input name="category" placeholder="Category" onChange={handleChange} required />
            <input
              type="datetime-local"
              name="eventDate"
              value={form.eventDate}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              min="1"
              step="0.01"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              required
            />

            <label className="label" style={{ marginTop: "8px", display: "block" }}>
              <input
                type="checkbox"
                name="hasSeats"
                checked={form.hasSeats}
                onChange={handleChange}
                style={{ marginRight: "8px" }}
              />
              Seat-based Event
            </label>

            <select
              name="recurrenceType"
              value={form.recurrenceType}
              onChange={handleChange}
            >
              <option value="NONE">No Recurrence</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>

            {form.hasSeats ? (
              <>
                <textarea
                  rows="4"
                  value={seatLayout}
                  onChange={(e) => setSeatLayout(e.target.value)}
                  placeholder="Enter seat codes (comma/new line), e.g. A1,A2,A3,B1"
                  required
                />
                <div className="subtext">Unique seats detected: {parsedUniqueSeats.length}</div>
                <input
                  name="availableSeats"
                  value={parsedUniqueSeats.length}
                  readOnly
                  placeholder="Available Seats"
                />
              </>
            ) : (
              <input
                type="number"
                min="1"
                name="availableSeats"
                placeholder="Available Tickets"
                value={form.availableSeats}
                onChange={handleChange}
                required
              />
            )}

            <button type="submit">Create Event</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateEventPage;
