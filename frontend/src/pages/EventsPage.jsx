import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCompletedEvents,
  getAllEvents,
  getLiveEvents,
  getNonSeatBasedEvents,
  getUpcomingEvents,
  getEventsByCategory,
  getEventsByLocation,
  getEventsByDate,
  getSeatBasedEvents,
} from "../services/eventService";
import Navbar from "../components/Navbar";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const formatAmount = (value) => Number(value || 0).toFixed(2);

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState("ALL");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const navigate = useNavigate();

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const name = sessionStorage.getItem("welcome_user");
    if (!name) return;

    setWelcomeMessage(`Welcome, ${name}. Your account is ready.`);
    sessionStorage.removeItem("welcome_user");

    const timer = setTimeout(() => setWelcomeMessage(""), 2800);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryFilter = async () => {
    try {
      setLoading(true);
      const data = await getEventsByCategory(category);
      setEvents(data);
    } catch (error) {
      console.error(error);
      alert("Category filter failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationFilter = async () => {
    try {
      setLoading(true);
      const data = await getEventsByLocation(location);
      setEvents(data);
    } catch (error) {
      console.error(error);
      alert("Location filter failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = async () => {
    try {
      setLoading(true);
      const data = await getEventsByDate(start, end);
      setEvents(data);
    } catch (error) {
      console.error(error);
      alert("Date filter failed");
    } finally {
      setLoading(false);
    }
  };

  const loadByView = async (view) => {
    try {
      setLoading(true);
      setActiveView(view);
      let data = [];
      if (view === "ALL") data = await getAllEvents();
      if (view === "LIVE") data = await getLiveEvents();
      if (view === "UPCOMING") data = await getUpcomingEvents();
      if (view === "COMPLETED") data = await getCompletedEvents();
      if (view === "SEAT_BASED") data = await getSeatBasedEvents();
      if (view === "NON_SEAT_BASED") data = await getNonSeatBasedEvents();
      setEvents(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load selected event view");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        {welcomeMessage && <div className="welcome-banner">{welcomeMessage}</div>}
        <div className="page-header">
          <h1 className="page-title">Explore Events</h1>
          <p className="page-subtitle">
            Discover approved events and book your tickets instantly.
          </p>
        </div>

        <div className="card">
          <h3>Filter Events</h3>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            <button className={activeView === "ALL" ? "" : "secondary"} onClick={() => loadByView("ALL")}>All</button>
            <button className={activeView === "LIVE" ? "" : "secondary"} onClick={() => loadByView("LIVE")}>Live</button>
            <button className={activeView === "UPCOMING" ? "" : "secondary"} onClick={() => loadByView("UPCOMING")}>Upcoming</button>
            <button className={activeView === "COMPLETED" ? "" : "secondary"} onClick={() => loadByView("COMPLETED")}>Completed</button>
            <button className={activeView === "SEAT_BASED" ? "" : "secondary"} onClick={() => loadByView("SEAT_BASED")}>Seat Based</button>
            <button className={activeView === "NON_SEAT_BASED" ? "" : "secondary"} onClick={() => loadByView("NON_SEAT_BASED")}>Non-seat</button>
          </div>

          <div className="grid-2">
            <div>
              <label className="label">Category</label>
              <input
                placeholder="e.g. MUSIC"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <button onClick={handleCategoryFilter}>Filter by Category</button>
            </div>

            <div>
              <label className="label">Location</label>
              <input
                placeholder="e.g. Hyderabad"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button onClick={handleLocationFilter}>Filter by Location</button>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: "10px" }}>
            <div>
              <label className="label">Start Date</label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>

            <div>
              <label className="label">End Date</label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={handleDateFilter}>Filter by Date</button>
            <button onClick={loadEvents} className="secondary">
              Show All Events
            </button>
          </div>
        </div>

        <div className="grid-2">
          {loading ? (
            <div className="card">
              <h3>Loading events...</h3>
              <p className="subtext">Please wait while we fetch the latest events.</p>
            </div>
          ) : events.length > 0 ? (
            events.map((event) => (
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

                <div className="info-row">
                  <strong>Location:</strong> {event.location}
                </div>
                <div className="info-row">
                  <strong>Category:</strong> {event.category}
                </div>
                <div className="info-row">
                  <strong>Date:</strong> {formatDateTime(event.eventDate)}
                </div>
                <div className="info-row">
                  <strong>Price:</strong> ₹{formatAmount(event.price)}
                </div>
                <div className="info-row">
                  <strong>Seats Available:</strong> {event.availableSeats}
                </div>
                <div className="info-row">
                  <strong>Event Status:</strong> {event.eventStatus || "UPCOMING"}
                </div>
                <div className="info-row">
                  <strong>Seat Selection:</strong> {event.hasSeats ? "Yes" : "No"}
                </div>

                <button
                  style={{ width: "100%", marginTop: "15px" }}
                  onClick={() => navigate("/book", { state: { event } })}
                >
                  Book Now
                </button>
              </div>
            ))
          ) : (
            <div className="card empty-state">
              <h3>No events found</h3>
              <p>Try changing filters or check again later.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default EventsPage;
