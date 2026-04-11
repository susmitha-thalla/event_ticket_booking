import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { getAllUsers } from "../services/adminService";
import { getAdminAllEvents } from "../services/eventService";
import { getAllBookings } from "../services/bookingService";

const getArrayFromPayload = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && typeof payload.data === "object") {
    for (const key of keys) {
      if (Array.isArray(payload.data[key])) return payload.data[key];
    }
  }

  return [];
};

const getCountFromPayload = (payload, keys = []) => {
  if (!payload || typeof payload !== "object") return null;

  const parseCount = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  for (const key of keys) {
    const count = parseCount(payload[key]);
    if (count !== null) return count;
  }

  if (payload.data && typeof payload.data === "object") {
    for (const key of keys) {
      const count = parseCount(payload.data[key]);
      if (count !== null) return count;
    }
  }

  return null;
};

const resolveCount = (records, payload, keys = []) => {
  const payloadCount = getCountFromPayload(payload, keys);
  if (records.length > 0) return records.length;
  if (payloadCount !== null) return payloadCount;
  return records.length;
};

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    bookings: 0,
    pendingEvents: 0,
    liveEvents: 0,
    cancelledBookings: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [usersPayload, eventsPayload, bookingsPayload] = await Promise.all([
          getAllUsers(),
          getAdminAllEvents(),
          getAllBookings(),
        ]);

        const users = getArrayFromPayload(usersPayload, ["users", "content", "items", "results"]);
        const events = getArrayFromPayload(eventsPayload, ["events", "content", "items", "results"]);
        const bookings = getArrayFromPayload(bookingsPayload, ["bookings", "content", "items", "results"]);

        const visibleEvents = (events || []).filter(
          (event) => !event.isDeleted && event.eventStatus !== "DELETED"
        );
        const now = Date.now();
        const isCompleted = (event) => {
          if (event.eventStatus === "COMPLETED") return true;
          const eventDate = new Date(event.eventDate);
          if (Number.isNaN(eventDate.getTime())) return false;
          return eventDate.getTime() < now;
        };

        const pendingEvents = visibleEvents.filter((event) => event.approvalStatus !== "APPROVED").length;
        const liveEvents = visibleEvents.filter((event) => event.eventStatus === "LIVE").length;
        const completedEvents = visibleEvents.filter((event) => isCompleted(event)).length;
        const upcomingEvents = visibleEvents.filter((event) => !isCompleted(event)).length;
        const cancelledBookings = bookings.filter((booking) => booking.bookingStatus === "CANCELLED").length;

        setStats({
          users: resolveCount(users, usersPayload, ["totalUsers", "usersCount", "count", "total", "totalElements"]),
          events: resolveCount(visibleEvents, eventsPayload, ["totalEvents", "eventsCount", "count", "total", "totalElements"]),
          upcomingEvents: upcomingEvents || getCountFromPayload(eventsPayload, ["upcomingEvents", "upcomingCount"]) || 0,
          completedEvents: completedEvents || getCountFromPayload(eventsPayload, ["completedEvents", "completedCount"]) || 0,
          bookings: resolveCount(bookings, bookingsPayload, ["totalBookings", "bookingsCount", "count", "total", "totalElements"]),
          pendingEvents: pendingEvents || getCountFromPayload(eventsPayload, ["pendingEvents", "pendingCount"]) || 0,
          liveEvents: liveEvents || getCountFromPayload(eventsPayload, ["liveEvents", "liveCount"]) || 0,
          cancelledBookings: cancelledBookings || getCountFromPayload(bookingsPayload, ["cancelledBookings", "cancelledCount"]) || 0,
        });
      } catch (error) {
        console.error(error);
      }
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
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Monitor users, approve events, and control bookings.</p>
        </div>

        <div className="grid-3">
          <div className="stat-box">
            <div className="stat-value">{stats.users}</div>
            <div className="stat-label">View all registered users</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/admin/users">Open</Link>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-value">{stats.events}</div>
            <div className="stat-label">
              Approve and manage all events
              <br />
              Pending: {stats.pendingEvents} | Live: {stats.liveEvents}
              <br />
              Upcoming: {stats.upcomingEvents} | Completed: {stats.completedEvents}
            </div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/admin/events">Open</Link>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-value">{stats.bookings}</div>
            <div className="stat-label">
              Review all user bookings
              <br />
              Cancelled: {stats.cancelledBookings}
            </div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/admin/bookings">Open</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboardPage;
