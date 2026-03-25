import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function HomePage() {
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="hero">
          <h1>Book Events with Confidence</h1>
          <p>
            Discover approved events, manage event hosting, and handle bookings with a clean
            three-role platform for users, organizers, and admins.
          </p>
        </div>

        <div className="page-header">
          <h2 className="page-title">Choose Your Portal</h2>
          <p className="page-subtitle">
            Access the platform based on your role and continue your event journey.
          </p>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-title">User Portal</div>
            <p className="subtext">Browse approved events, filter by category and location, and book tickets.</p>
            <p><Link to="/user/signup">Create User Account</Link></p>
            <p><Link to="/user/login">User Login</Link></p>
          </div>

          <div className="card">
            <div className="card-title">Organizer Portal</div>
            <p className="subtext">Create events, track your listings, and view bookings on your hosted events.</p>
            <p><Link to="/organizer/signup">Create Organizer Account</Link></p>
            <p><Link to="/organizer/login">Organizer Login</Link></p>
          </div>

          <div className="card">
            <div className="card-title">Admin Portal</div>
            <p className="subtext">Approve events, monitor users, and manage the full platform.</p>
            <p><Link to="/admin/login">Admin Login</Link></p>
          </div>

          <div className="card">
            <div className="card-title">Explore Events</div>
            <p className="subtext">Jump directly to the approved events page and start browsing.</p>
            <p><Link to="/events">View Approved Events</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;