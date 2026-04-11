import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const isEventDeleted = (event) => event?.isDeleted || event?.eventStatus === "DELETED";
  const isEventCompleted = (event) => {
    if (!event) return false;
    if (event.eventStatus === "COMPLETED") return true;
    if (!event.eventDate) return false;
    const eventDate = new Date(event.eventDate);
    if (Number.isNaN(eventDate.getTime())) return false;
    return eventDate.getTime() < Date.now();
  };

  const loadEvents = async () => {
    try {
      const data = await getMyEvents();
      setEvents(data || []);
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
      setEvents((previous) =>
        previous.map((event) =>
          event.eventId === eventId
            ? { ...event, isDeleted: true, eventStatus: "DELETED" }
            : event
        )
      );
    } catch (error) {
      console.error(error);
      alert(error.response?.data || "Delete failed");
    }
  };

  const upcomingEvents = events.filter(
    (event) => !isEventDeleted(event) && !isEventCompleted(event)
  );
  const completedEvents = events.filter(
    (event) => !isEventDeleted(event) && isEventCompleted(event)
  );
  const deletedEvents = events.filter((event) => isEventDeleted(event));
  const activeTab = searchParams.get("tab") || "upcoming";

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const renderEventCard = (event, options = {}) => (
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

      {!options.isDeletedList && (
        <div style={{ marginTop: "10px" }}>
          <button className="danger" onClick={() => handleDelete(event.eventId)}>
            Delete Event
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>My Events</h2>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          <button
            type="button"
            className={activeTab === "upcoming" ? "" : "secondary"}
            onClick={() => setTab("upcoming")}
          >
            Upcoming ({upcomingEvents.length})
          </button>
          <button
            type="button"
            className={activeTab === "completed" ? "" : "secondary"}
            onClick={() => setTab("completed")}
          >
            Completed ({completedEvents.length})
          </button>
          <button
            type="button"
            className={activeTab === "deleted" ? "danger" : "secondary"}
            onClick={() => setTab("deleted")}
          >
            Deleted ({deletedEvents.length})
          </button>
        </div>

        {activeTab === "upcoming" && (
          <>
            <h3>Upcoming Events ({upcomingEvents.length})</h3>
            {upcomingEvents.length === 0 ? (
              <div className="card empty-state">
                <p>No upcoming events.</p>
              </div>
            ) : (
              upcomingEvents.map((event) => renderEventCard(event))
            )}
          </>
        )}

        {activeTab === "completed" && (
          <>
            <h3>Completed Events ({completedEvents.length})</h3>
            {completedEvents.length === 0 ? (
              <div className="card empty-state">
                <p>No completed events.</p>
              </div>
            ) : (
              completedEvents.map((event) => renderEventCard(event))
            )}
          </>
        )}

        {activeTab === "deleted" && (
          <>
            <h3>Deleted Events ({deletedEvents.length})</h3>
            {deletedEvents.length === 0 ? (
              <div className="card empty-state">
                <p>No deleted events.</p>
              </div>
            ) : (
              deletedEvents.map((event) => renderEventCard(event, { isDeletedList: true }))
            )}
          </>
        )}
      </div>
    </>
  );
}

export default MyEventsPage;
