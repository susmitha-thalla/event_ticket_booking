import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { approveEvent, deleteEvent, getAdminAllEvents } from "../services/eventService";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const formatAmount = (value) => Number(value || 0).toFixed(2);
const isEventDeleted = (event) => event?.isDeleted || event?.eventStatus === "DELETED";
const isEventCompleted = (event) => {
  if (!event) return false;
  if (event.eventStatus === "COMPLETED") return true;
  if (!event.eventDate) return false;
  const eventDate = new Date(event.eventDate);
  if (Number.isNaN(eventDate.getTime())) return false;
  return eventDate.getTime() < Date.now();
};

function AllEventsPage() {
  const [events, setEvents] = useState([]);

  const loadEvents = async () => {
    try {
      const data = await getAdminAllEvents();
      setEvents((data || []).filter((event) => !isEventDeleted(event)));
    } catch (error) {
      console.error(error);
      alert("Failed to load events");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleApprove = async (eventId) => {
    try {
      const response = await approveEvent(eventId);
      alert(response);
      loadEvents();
    } catch (error) {
      console.error(error);
      alert("Approval failed❌");
    }
  };

  const handleDelete = async (eventId) => {
    try {
      const response = await deleteEvent(eventId);
      alert(response);
      setEvents((previous) => previous.filter((event) => event.eventId !== eventId));
    } catch (error) {
      console.error(error);
      alert(error.response?.data || "Delete failed");
    }
  };

  const upcomingEvents = events.filter((event) => !isEventCompleted(event));
  const completedEvents = events.filter((event) => isEventCompleted(event));

  const renderEventCard = (event) => (
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
      <div className="card-title">{event.title}</div>
      <p className="subtext">{event.description}</p>

      <div className="info-row"><strong>Location:</strong> {event.location}</div>
      <div className="info-row"><strong>Category:</strong> {event.category}</div>
      <div className="info-row"><strong>Date:</strong> {formatDateTime(event.eventDate)}</div>
      <div className="info-row"><strong>Price:</strong> ₹{formatAmount(event.price)}</div>
      <div className="info-row"><strong>Seats:</strong> {event.availableSeats}</div>
      <div className="info-row"><strong>Created By:</strong> {event.createdBy}</div>
      <div className="info-row"><strong>Event Status:</strong> {event.eventStatus || "UPCOMING"}</div>
      <div className="info-row"><strong>Recurrence:</strong> {event.recurrenceType || "NONE"}</div>
      <div className="info-row"><strong>Seat Selection:</strong> {event.hasSeats ? "Yes" : "No"}</div>

      <span
        className={`badge ${
          event.approvalStatus === "APPROVED" ? "approved" : "pending"
        }`}
      >
        {event.approvalStatus}
      </span>

      {event.approvalStatus !== "APPROVED" && (
        <div>
          <button onClick={() => handleApprove(event.eventId)}>
            Approve Event
          </button>
        </div>
      )}

      <div style={{ marginTop: "10px" }}>
        <button className="danger" onClick={() => handleDelete(event.eventId)}>
          Delete Event
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">All Events</h1>
          <p className="page-subtitle">Review event requests and approve them for public visibility.</p>
        </div>

        <h2>Upcoming Events ({upcomingEvents.length})</h2>
        {upcomingEvents.length === 0 ? (
          <div className="card empty-state">
            <p>No upcoming events available.</p>
          </div>
        ) : (
          upcomingEvents.map((event) => renderEventCard(event))
        )}

        <h2 style={{ marginTop: "20px" }}>Completed Events ({completedEvents.length})</h2>
        {completedEvents.length === 0 ? (
          <div className="card empty-state">
            <p>No completed events yet.</p>
          </div>
        ) : (
          completedEvents.map((event) => renderEventCard(event))
        )}
      </div>
    </>
  );
}

export default AllEventsPage;
