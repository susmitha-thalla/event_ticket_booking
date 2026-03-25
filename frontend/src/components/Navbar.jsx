import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        <div className="logo">🎟 Event Booking</div>

        <Link to="/">Home</Link>

        {(role === "USER" || role === "ROLE_USER") && (
          <>
            <Link to="/events">Events</Link>
            <Link to="/my-bookings">My Bookings</Link>
          </>
        )}

        {(role === "ORGANIZER" || role === "ROLE_ORGANIZER") && (
          <>
            <Link to="/organizer/dashboard">Dashboard</Link>
            <Link to="/organizer/create-event">Create Event</Link>
            <Link to="/organizer/my-events">My Events</Link>
            <Link to="/organizer/bookings">Bookings</Link>
          </>
        )}

        {(role === "ADMIN" || role === "ROLE_ADMIN") && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/events">Events</Link>
            <Link to="/admin/bookings">Bookings</Link>
          </>
        )}
      </div>

      {role && (
        <button className="danger" onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  );
}

export default Navbar;