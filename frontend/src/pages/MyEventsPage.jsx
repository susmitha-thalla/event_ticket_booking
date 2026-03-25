import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getMyEvents } from "../services/eventService";

function MyEventsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getMyEvents();
        setEvents(data);
      } catch (error) {
        console.error(error);
        alert("Failed to load my events");
      }
    };

    loadEvents();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>My Events</h2>

        {events.map((event) => (
          <div className="card" key={event.eventId}>
            <h3>{event.title}</h3>
            <p className="subtext">{event.description}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Date:</strong> {event.eventDate}</p>
            <p><strong>Price:</strong> ₹{event.price}</p>
            <p><strong>Seats:</strong> {event.availableSeats}</p>

            <span
              className={`badge ${
                event.approvalStatus === "APPROVED" ? "approved" : "pending"
              }`}
            >
              {event.approvalStatus}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default MyEventsPage;