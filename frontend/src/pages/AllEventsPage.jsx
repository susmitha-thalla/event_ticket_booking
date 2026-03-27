import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { approveEvent, getAdminAllEvents } from "../services/eventService";

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
            <div className="info-row"><strong>Date:</strong> {event.eventDate}</div>
            <div className="info-row"><strong>Price:</strong> ₹{event.price}</div>
            <div className="info-row"><strong>Seats:</strong> {event.availableSeats}</div>
            <div className="info-row"><strong>Created By:</strong> {event.createdBy}</div>

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
          </div>
        ))}
      </div>
    </>
  );
}

export default AllEventsPage;