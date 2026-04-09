import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { approveEvent, getAdminAllEvents } from "../services/eventService";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const formatAmount = (value) => Number(value || 0).toFixed(2);

function AllEventsPage() {
  const [events, setEvents] = useState([]);

  const loadEvents = async () => {
    try {
      const data = await getAdminAllEvents();
      setEvents(data);
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

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">All Events</h1>
          <p className="page-subtitle">Review event requests and approve them for public visibility.</p>
        </div>

        {events.map((event) => (
          <div className="card" key={event.eventId}>
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

            <span
              className={`badge ${
                event.isDeleted || event.eventStatus === "DELETED" ? "pending" : "approved"
              }`}
              style={{ marginLeft: "10px" }}
            >
              {event.isDeleted || event.eventStatus === "DELETED" ? "DELETED" : "ACTIVE"}
            </span>

            {event.approvalStatus !== "APPROVED" && !event.isDeleted && (
              <div>
                <button onClick={() => handleApprove(event.eventId)}>
                  Approve Event
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default AllEventsPage;
