import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  deleteEvent,
  getMyEvents,
} from "../services/eventService";

function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getMyEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert("Failed to load my events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (filter === "ALL") return events;
    return events.filter(
      (event) =>
        (event.approvalStatus || "").toUpperCase() === filter.toUpperCase()
    );
  }, [events, filter]);

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmed) return;

    try {
      const response = await deleteEvent(eventId);
      alert(
        typeof response === "string"
          ? response
          : "Event deleted successfully"
      );
      await loadEvents();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to delete event"
      );
    }
  };

  const handleManageSeats = (eventId) => {
    navigate(`/organizer/events/${eventId}/seats`);
  };

  const handleEditEvent = (eventId) => {
    navigate(`/organizer/events/edit/${eventId}`);
  };

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const getApprovalBadgeClass = (status) => {
    const normalized = (status || "").toUpperCase();
    if (normalized === "APPROVED") return "approved";
    if (normalized === "REJECTED") return "rejected";
    return "pending";
  };

  const getEventStatusBadgeClass = (status) => {
    const normalized = (status || "").toUpperCase();
    if (normalized === "LIVE") return "live";
    if (normalized === "COMPLETED") return "completed";
    if (normalized === "DELETED") return "deleted";
    return "upcoming";
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <h2>My Events</h2>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <label htmlFor="approvalFilter"><strong>Filter:</strong></label>
            <select
              id="approvalFilter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <p>No events found.</p>
        ) : (
          filteredEvents.map((event) => (
            <div className="card" key={event.eventId} style={{ marginBottom: "1rem" }}>
              {event.seatMapImageUrl && (
                <img
                  src={event.seatMapImageUrl}
                  alt={event.title}
                  style={{
                    width: "100%",
                    maxHeight: "260px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    marginBottom: "1rem",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}

              <h3>{event.title}</h3>
              <p className="subtext">{event.description}</p>

              <p><strong>Location:</strong> {event.location || "N/A"}</p>
              <p><strong>City:</strong> {event.city || "N/A"}</p>
              <p><strong>Address:</strong> {event.address || "N/A"}</p>
              <p><strong>Category:</strong> {event.category || "N/A"}</p>
              <p><strong>Venue Type:</strong> {event.venueType || "N/A"}</p>
              <p><strong>Start Time:</strong> {formatDateTime(event.startTime || event.eventDate)}</p>
              <p><strong>End Time:</strong> {formatDateTime(event.endTime)}</p>
              <p><strong>Price:</strong> ₹{event.price ?? 0}</p>
              <p><strong>Seat Based:</strong> {event.hasSeats ? "Yes" : "No"}</p>
              <p><strong>Available Seats:</strong> {event.availableSeats ?? "N/A"}</p>
              <p><strong>Total Seats:</strong> {event.totalSeats ?? "N/A"}</p>
              <p><strong>Event Code:</strong> {event.eventCode || "N/A"}</p>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                <span className={`badge ${getApprovalBadgeClass(event.approvalStatus)}`}>
                  {event.approvalStatus || "PENDING"}
                </span>

                <span className={`badge ${getEventStatusBadgeClass(event.eventStatus)}`}>
                  {event.eventStatus || "UPCOMING"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  marginTop: "1rem",
                }}
              >
                <button onClick={() => handleEditEvent(event.eventId)}>
                  Edit Event
                </button>

                {event.hasSeats && (
                  <button onClick={() => handleManageSeats(event.eventId)}>
                    Manage Seats
                  </button>
                )}

                <button
                  onClick={() => handleDelete(event.eventId)}
                  style={{ backgroundColor: "#c62828", color: "white" }}
                >
                  Delete Event
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default MyEventsPage;