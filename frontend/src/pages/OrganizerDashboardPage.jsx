import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function OrganizerDashboardPage() {
  const [welcomeMessage, setWelcomeMessage] = useState("");

  useEffect(() => {
    const name = sessionStorage.getItem("welcome_organizer");
    if (!name) return;

    setWelcomeMessage(`Welcome, ${name}. Your organizer dashboard is ready.`);
    sessionStorage.removeItem("welcome_organizer");

    const timer = setTimeout(() => setWelcomeMessage(""), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        {welcomeMessage && <div className="welcome-banner">{welcomeMessage}</div>}
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

          <div className="stat-box">
            <div className="stat-value">Completed</div>
            <div className="stat-label">Open completed events list</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/organizer/my-events?tab=completed">Open</Link>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-value">Deleted</div>
            <div className="stat-label">View deleted events separately</div>
            <div style={{ marginTop: "14px" }}>
              <Link to="/organizer/my-events?tab=deleted">Open</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrganizerDashboardPage;
