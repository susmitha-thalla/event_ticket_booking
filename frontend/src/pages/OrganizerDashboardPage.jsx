import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { getMyEvents } from "../services/eventService";
import { getOrganizerBookings } from "../services/bookingService";

const normalizeStatus = (value) => String(value || "").trim().toUpperCase();
const toNumeric = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isEventCancelled = (event) => {
  const status = normalizeStatus(event?.eventStatus || event?.status);
  return (
    Boolean(event?.isDeleted) ||
    status === "CANCELLED" ||
    status === "CANCELED" ||
    status === "DELETED"
  );
};

const isEventCompleted = (event) => {
  if (!event) return false;
  const status = normalizeStatus(event?.eventStatus || event?.status);
  if (status === "COMPLETED" || status === "ENDED") return true;
  if (toNumeric(event?.availableSeats, 0) <= 0) return true;

  const eventDate = new Date(event?.eventDate);
  if (Number.isNaN(eventDate.getTime())) return false;
  return eventDate.getTime() < Date.now();
};

function OrganizerDashboardPage() {
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: 0,
    cancelledEvents: 0,
    bookings: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const name = sessionStorage.getItem("welcome_organizer");
    if (!name) return;

    setWelcomeMessage(`Welcome, ${name}. Your organizer dashboard is ready.`);
    sessionStorage.removeItem("welcome_organizer");

    const timer = setTimeout(() => setWelcomeMessage(""), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      const [eventsResult, bookingsResult] = await Promise.allSettled([
        getMyEvents(),
        getOrganizerBookings(),
      ]);

      const events = eventsResult.status === "fulfilled" && Array.isArray(eventsResult.value)
        ? eventsResult.value
        : [];
      const bookings = bookingsResult.status === "fulfilled" && Array.isArray(bookingsResult.value)
        ? bookingsResult.value
        : [];

      const cancelledEvents = events.filter((event) => isEventCancelled(event));
      const completedEvents = events.filter(
        (event) => !isEventCancelled(event) && isEventCompleted(event)
      );
      const activeEvents = events.filter(
        (event) => !isEventCancelled(event) && !isEventCompleted(event)
      );

      setStats({
        totalEvents: events.length,
        activeEvents: activeEvents.length,
        completedEvents: completedEvents.length,
        cancelledEvents: cancelledEvents.length,
        bookings: bookings.length,
      });

      const failedSegments = [];
      if (eventsResult.status === "rejected") failedSegments.push("events");
      if (bookingsResult.status === "rejected") failedSegments.push("bookings");

      setErrorMessage(
        failedSegments.length > 0
          ? `Some organizer dashboard data could not be refreshed (${failedSegments.join(", ")}).`
          : ""
      );
    };

    loadStats();
    const refreshId = window.setInterval(loadStats, 15000);
    const onFocus = () => loadStats();
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(refreshId);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        {welcomeMessage && <div className="welcome-banner">{welcomeMessage}</div>}
        {errorMessage && <div className="message-error">{errorMessage}</div>}
        <div className="page-header">
          <h1 className="page-title">Organizer Dashboard</h1>
          <p className="page-subtitle">Create events, review approvals, and track bookings.</p>
        </div>

        <div className="grid-3">
          <div className="stat-box">
            <div className="stat-value">Create</div>
            <div className="stat-label">Launch a new event listing</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/organizer/create-event">Open</Link>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-value">{stats.totalEvents}</div>
            <div className="stat-label">
              View your created events
              <br />
              Active: {stats.activeEvents}
            </div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/organizer/my-events">Open</Link>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-value">{stats.bookings}</div>
            <div className="stat-label">See bookings on your events</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/organizer/bookings">Open</Link>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-value">{stats.completedEvents}</div>
            <div className="stat-label">Open completed/sold-out events list</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/organizer/my-events?tab=completed">Open</Link>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-value">{stats.cancelledEvents}</div>
            <div className="stat-label">View cancelled events separately</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/organizer/my-events?tab=cancelled">Open</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrganizerDashboardPage;
