import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function AdminDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (!role || (role !== "ADMIN" && role !== "ROLE_ADMIN")) {
      alert("Access denied. Admin only.");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            Monitor users, approve events, manage bookings, and control the platform.
          </p>
        </div>

        <div className="grid-3">
          
          {/* USERS */}
          <div className="stat-box">
            <div className="stat-value">Users</div>
            <div className="stat-label">View all registered users</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/admin/users">Open</Link>
            </div>
          </div>

          {/* EVENTS */}
          <div className="stat-box">
            <div className="stat-value">Events</div>
            <div className="stat-label">Approve / Reject / Delete events</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/admin/events">Open</Link>
            </div>
          </div>

          {/* BOOKINGS */}
          <div className="stat-box">
            <div className="stat-value">Bookings</div>
            <div className="stat-label">Review all user bookings</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/admin/bookings">Open</Link>
            </div>
          </div>

        </div>

        {/* NEW QUICK ACTIONS */}
        <div style={{ marginTop: "30px" }}>
          <h3>Quick Actions</h3>

          <div className="grid-3">

            <div className="card">
              <h4>Pending Events</h4>
              <p>Approve or reject events waiting for review.</p>
              <Link to="/admin/events?filter=pending">View</Link>
            </div>

            <div className="card">
              <h4>All Events</h4>
              <p>See all events including live and upcoming.</p>
              <Link to="/admin/events">View</Link>
            </div>

            <div className="card">
              <h4>All Bookings</h4>
              <p>Track bookings and transactions.</p>
              <Link to="/admin/bookings">View</Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboardPage;