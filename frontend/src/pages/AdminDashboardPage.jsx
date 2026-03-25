import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function AdminDashboardPage() {
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
            <div className="stat-value">Users</div>
            <div className="stat-label">View all registered users</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/admin/users">Open</Link>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-value">Events</div>
            <div className="stat-label">Approve and manage all events</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/admin/events">Open</Link>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-value">Bookings</div>
            <div className="stat-label">Review all user bookings</div>
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