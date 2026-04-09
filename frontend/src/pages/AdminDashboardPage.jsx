import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { getAllUsers } from "../services/adminService";
import { getAdminAllEvents } from "../services/eventService";
import { getAllBookings } from "../services/bookingService";

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    bookings: 0,
    pendingEvents: 0,
    liveEvents: 0,
    cancelledBookings: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [users, events, bookings] = await Promise.all([
          getAllUsers(),
          getAdminAllEvents(),
          getAllBookings(),
        ]);

        const pendingEvents = events.filter((event) => event.approvalStatus !== "APPROVED").length;
        const liveEvents = events.filter((event) => event.eventStatus === "LIVE").length;
        const cancelledBookings = bookings.filter((booking) => booking.bookingStatus === "CANCELLED").length;

        setStats({
          users: users.length,
          events: events.length,
          bookings: bookings.length,
          pendingEvents,
          liveEvents,
          cancelledBookings,
        });
      } catch (error) {
        console.error(error);
      }
    };

    loadStats();
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
