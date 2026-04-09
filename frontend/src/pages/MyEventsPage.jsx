import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { deleteEvent, getMyEvents } from "../services/eventService";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

function MyEventsPage() {
  const [events, setEvents] = useState([]);

  const loadEvents = async () => {
    try {
      const data = await getMyEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load my events");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (eventId) => {
    try {
      const response = await deleteEvent(eventId);
      alert(response);
      loadEvents();
    } catch (error) {
      console.error(error);
      alert(error.response?.data || "Delete failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>My Events</h2>

        {events.map((event) => (
          <div className="card" key={event.eventId}>
            {event.wallpaperUrl ? (
              <img
                src={event.wallpaperUrl}
                alt={`${event.title} wallpaper`}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginBottom: "12px",
                }}
              />
            ) : null}
            <h3>{event.title}</h3>
            <p className="subtext">{event.description}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Date:</strong> {formatDateTime(event.eventDate)}</p>
            <p><strong>Price:</strong> ₹{event.price}</p>
            <p><strong>Seats:</strong> {event.availableSeats}</p>
            <p><strong>Status:</strong> {event.eventStatus || "UPCOMING"}</p>

            <span
              className={`badge ${
                event.approvalStatus === "APPROVED" ? "approved" : "pending"
              }`}
            >
              {event.approvalStatus}
            </span>

            {!event.isDeleted && (
              <div style={{ marginTop: "10px" }}>
                <button className="danger" onClick={() => handleDelete(event.eventId)}>
                  Delete Event
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default MyEventsPage;
