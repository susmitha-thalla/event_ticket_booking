import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function OrganizerDashboardPage() {
  return (
    <>
      <Navbar />
      <div className="container">
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
            <div className="stat-value">Events</div>
            <div className="stat-label">View your created events</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/organizer/my-events">Open</Link>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-value">Bookings</div>
            <div className="stat-label">See bookings on your events</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/organizer/bookings">Open</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrganizerDashboardPage;