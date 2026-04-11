import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
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
  if (records.length > 0 || payloadCount === null) return records.length;
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
    cancelledEvents: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      const [usersResult, eventsResult, bookingsResult] = await Promise.allSettled([
        getAllUsers(),
        getAdminAllEvents(),
        getAllBookings(),
      ]);

      const results = [usersResult, eventsResult, bookingsResult];
      const fulfilledCount = results.filter((result) => result.status === "fulfilled").length;
      const authFailureCount = results.filter(
        (result) =>
          result.status === "rejected" &&
          (result.reason?.response?.status === 401 || result.reason?.response?.status === 403)
      ).length;

      if (fulfilledCount === 0 && authFailureCount > 0) {
        navigate("/admin/login");
        return;
      }

      const usersPayload = usersResult.status === "fulfilled" ? usersResult.value : [];
      const eventsPayload = eventsResult.status === "fulfilled" ? eventsResult.value : [];
      const bookingsPayload = bookingsResult.status === "fulfilled" ? bookingsResult.value : [];

      const users = getArrayFromPayload(usersPayload, ["users", "content", "items", "results"]);
      const events = getArrayFromPayload(eventsPayload, ["events", "content", "items", "results"]);
      const bookings = getArrayFromPayload(bookingsPayload, ["bookings", "content", "items", "results"]);

      const deletedOrCancelledEvents = (events || []).filter((event) => {
        const status = String(event?.eventStatus || "").toUpperCase();
        return (
          event?.isDeleted ||
          status === "DELETED" ||
          status === "CANCELLED" ||
          status === "CANCELED"
        );
      });

      const visibleEvents = (events || []).filter(
        (event) => !deletedOrCancelledEvents.some((removedEvent) => removedEvent?.eventId === event?.eventId)
      );

      const now = Date.now();
      const isCompleted = (event) => {
        const status = String(event?.eventStatus || "").toUpperCase();
        if (status === "COMPLETED" || status === "ENDED") return true;

        const eventDate = new Date(event?.eventDate);
        if (Number.isNaN(eventDate.getTime())) return false;
        return eventDate.getTime() < now;
      };

      const pendingEvents = visibleEvents.filter((event) => String(event?.approvalStatus || "").toUpperCase() !== "APPROVED").length;
      const liveEvents = visibleEvents.filter((event) => String(event?.eventStatus || "").toUpperCase() === "LIVE").length;
      const completedEvents = visibleEvents.filter((event) => isCompleted(event)).length;
      const upcomingEvents = visibleEvents.filter((event) => !isCompleted(event)).length;
      const cancelledBookings = bookings.filter((booking) => {
        const status = String(booking?.bookingStatus || booking?.status || "").toUpperCase();
        return status === "CANCELLED" || status === "CANCELED";
      }).length;

      const failedSegments = [];
      if (usersResult.status === "rejected") failedSegments.push("users");
      if (eventsResult.status === "rejected") failedSegments.push("events");
      if (bookingsResult.status === "rejected") failedSegments.push("bookings");

      setErrorMessage(
        failedSegments.length > 0
          ? `Some dashboard data could not be refreshed (${failedSegments.join(", ")}). Showing available values.`
          : ""
      );

      setStats({
        users: resolveCount(users, usersPayload, ["totalUsers", "usersCount", "count", "total", "totalElements"]),
        events: resolveCount(visibleEvents, eventsPayload, ["totalEvents", "eventsCount", "count", "total", "totalElements"]),
        upcomingEvents: upcomingEvents || getCountFromPayload(eventsPayload, ["upcomingEvents", "upcomingCount"]) || 0,
        completedEvents: completedEvents || getCountFromPayload(eventsPayload, ["completedEvents", "completedCount"]) || 0,
        bookings: resolveCount(bookings, bookingsPayload, ["totalBookings", "bookingsCount", "count", "total", "totalElements"]),
        pendingEvents: pendingEvents || getCountFromPayload(eventsPayload, ["pendingEvents", "pendingCount"]) || 0,
        liveEvents: liveEvents || getCountFromPayload(eventsPayload, ["liveEvents", "liveCount"]) || 0,
        cancelledBookings: cancelledBookings || getCountFromPayload(bookingsPayload, ["cancelledBookings", "cancelledCount"]) || 0,
        cancelledEvents:
          deletedOrCancelledEvents.length ||
          getCountFromPayload(eventsPayload, ["cancelledEvents", "cancelledCount", "deletedEvents", "deletedCount"]) ||
          0,
      });
    };

    loadStats();
    const refreshId = window.setInterval(loadStats, 15000);
    const onFocus = () => loadStats();
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(refreshId);
      window.removeEventListener("focus", onFocus);
    };
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Monitor users, approve events, and control bookings.</p>
        </div>
        {errorMessage && <div className="message-error">{errorMessage}</div>}

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
              <br />
              Cancelled/Deleted: {stats.cancelledEvents}
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
