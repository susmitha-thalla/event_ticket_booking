import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllEvents,
  getLiveEvents,
  getNonSeatBasedEvents,
  getUpcomingEvents,
  getSeatBasedEvents,
} from "../services/eventService";
import Navbar from "../components/Navbar";
import { INDIAN_LOCATION_INDEX } from "../data/indianLocations";
import { searchIndianLocations } from "../services/locationService";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const formatAmount = (value) => Number(value || 0).toFixed(2);
const isEventDeleted = (event) => event?.isDeleted || event?.eventStatus === "DELETED";
const isEventCompleted = (event) => {
  if (!event) return false;
  if (event.eventStatus === "COMPLETED") return true;
  if (!event.eventDate) return false;
  const eventDate = new Date(event.eventDate);
  if (Number.isNaN(eventDate.getTime())) return false;
  return eventDate.getTime() < Date.now();
};
const toDisplayableUserEvents = (events) =>
  (events || []).filter((event) => !isEventDeleted(event) && !isEventCompleted(event));

const getThemeClassFromCategory = (category = "") => {
  const normalized = String(category).toLowerCase();
  if (normalized.includes("music") || normalized.includes("concert")) return "event-theme-music";
  if (normalized.includes("stand") || normalized.includes("comedy")) return "event-theme-standup";
  if (normalized.includes("night") || normalized.includes("party")) return "event-theme-night";
  if (normalized.includes("culture") || normalized.includes("cultural")) return "event-theme-cultural";
  return "event-theme-default";
};

function EventsPage() {
  const [allEvents, setAllEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [activeView, setActiveView] = useState("ALL");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const navigate = useNavigate();

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getAllEvents();
      setAllEvents(toDisplayableUserEvents(data));
      setActiveView("ALL");
    } catch (error) {
      console.error(error);
      alert("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const name = sessionStorage.getItem("welcome_user");
    if (!name) return;

    setWelcomeMessage(`Welcome, ${name}. Your account is ready.`);
    sessionStorage.removeItem("welcome_user");

    const timer = setTimeout(() => setWelcomeMessage(""), 2800);
    return () => clearTimeout(timer);
  }, []);

  const loadByView = async (view) => {
    try {
      setLoading(true);
      setActiveView(view);
      let data = [];
      if (view === "ALL") data = await getAllEvents();
      if (view === "LIVE") data = await getLiveEvents();
      if (view === "UPCOMING") data = await getUpcomingEvents();
      if (view === "SEAT_BASED") data = await getSeatBasedEvents();
      if (view === "NON_SEAT_BASED") data = await getNonSeatBasedEvents();
      setAllEvents(toDisplayableUserEvents(data));
    } catch (error) {
      console.error(error);
      alert("Failed to load selected event view");
    } finally {
      setLoading(false);
    }
  };

  const locationOptions = useMemo(() => {
    const eventLocations = (allEvents || [])
      .map((event) => (event.location || "").trim())
      .filter(Boolean)
      .map((name) => ({
        label: `${name} - Event Venue`,
        city: name,
      }));

    const merged = [...INDIAN_LOCATION_INDEX, ...eventLocations];
    const uniqueMap = new Map();
    for (const item of merged) {
      if (!uniqueMap.has(item.label)) uniqueMap.set(item.label, item);
    }
    return Array.from(uniqueMap.values());
  }, [allEvents]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        setLocationLoading(true);
        const suggestions = await searchIndianLocations(locationInput, locationOptions, 30);
        if (active) {
          setLocationSuggestions(suggestions);
        }
      } finally {
        if (active) setLocationLoading(false);
      }
    }, 220);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [locationInput, locationOptions]);

  const visibleEvents = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    return (allEvents || []).filter((event) => {
      const eventCategory = (event.category || "").toUpperCase();
      const eventLocation = (event.location || "").trim().toLowerCase();
      const locationQuery = locationInput.trim().toLowerCase();
      const eventPrice = Number(event.price || 0);
      const eventDate = new Date(event.eventDate);

      if (selectedCategory && eventCategory !== selectedCategory) return false;
      if (locationQuery && !eventLocation.includes(locationQuery)) return false;

      if (Number.isFinite(min) && eventPrice < min) return false;
      if (Number.isFinite(max) && eventPrice > max) return false;

      if (searchLower) {
        const haystack = [
          event.title,
          event.description,
          event.location,
          event.category,
          String(event.price),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }

      if (!Number.isNaN(eventDate.getTime())) {
        if (start) {
          const startDate = new Date(`${start}T00:00:00`);
          if (eventDate.getTime() < startDate.getTime()) return false;
        }

        if (end) {
          const endDate = new Date(`${end}T23:59:59`);
          if (eventDate.getTime() > endDate.getTime()) return false;
        }
      }

      return true;
    });
  }, [allEvents, selectedCategory, locationInput, minPrice, maxPrice, searchTerm, start, end]);

  const clearLocalFilters = () => {
    setSelectedCategory("");
    setLocationInput("");
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setStart("");
    setEnd("");
  };

  return (
    <>
      <Navbar />
      <div className="container">
        {welcomeMessage && <div className="welcome-banner">{welcomeMessage}</div>}
        <div className="page-header">
          <h1 className="page-title">Explore Events</h1>
          <p className="page-subtitle">
            Discover approved events and book your tickets instantly.
          </p>
        </div>

        <div className="search-strip">
          <input
            className="search-input"
            placeholder="Search by event name, location, category, or price..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="price-range">
            <input
              type="number"
              min="0"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <h3 style={{ marginBottom: "10px" }}>Event Types</h3>
        <div className="filter-chip-row">
          <button className={`filter-chip ${activeView === "ALL" ? "active" : ""}`} onClick={() => loadByView("ALL")}>
            All Events
          </button>
          <button className={`filter-chip ${activeView === "LIVE" ? "active" : ""}`} onClick={() => loadByView("LIVE")}>
            Live
          </button>
          <button className={`filter-chip ${activeView === "UPCOMING" ? "active" : ""}`} onClick={() => loadByView("UPCOMING")}>
            Upcoming
          </button>
          <button className={`filter-chip ${activeView === "SEAT_BASED" ? "active" : ""}`} onClick={() => loadByView("SEAT_BASED")}>
            Seat Based
          </button>
          <button className={`filter-chip ${activeView === "NON_SEAT_BASED" ? "active" : ""}`} onClick={() => loadByView("NON_SEAT_BASED")}>
            Non-seat
          </button>
        </div>

        <h3 style={{ marginTop: "14px", marginBottom: "8px" }}>Categories</h3>
        <div className="filter-chip-row">
          <button
            className={`filter-chip ${selectedCategory === "MUSIC" ? "active" : ""}`}
            onClick={() =>
              setSelectedCategory((previous) => (previous === "MUSIC" ? "" : "MUSIC"))
            }
          >
            Music Concerts
          </button>
          <button
            className={`filter-chip ${selectedCategory === "STANDUP" ? "active" : ""}`}
            onClick={() =>
              setSelectedCategory((previous) => (previous === "STANDUP" ? "" : "STANDUP"))
            }
          >
            Stand-up Comedy
          </button>
          <button
            className={`filter-chip ${selectedCategory === "NIGHT" ? "active" : ""}`}
            onClick={() =>
              setSelectedCategory((previous) => (previous === "NIGHT" ? "" : "NIGHT"))
            }
          >
            Night Events
          </button>
          <button
            className={`filter-chip ${selectedCategory === "CULTURAL" ? "active" : ""}`}
            onClick={() =>
              setSelectedCategory((previous) => (previous === "CULTURAL" ? "" : "CULTURAL"))
            }
          >
            Cultural Events
          </button>
        </div>

        <div className="grid-2" style={{ marginTop: "12px" }}>
          <div>
            <label className="label">Location (City / Pincode / District / Mandal)</label>
            <input
              type="text"
              list="india-location-suggestions"
              placeholder="Type first letter (e.g. H, B, 5...)"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
            />
            <datalist id="india-location-suggestions">
              {locationSuggestions.map((item) => (
                <option key={item.label} value={item.city}>
                  {item.label}
                </option>
              ))}
            </datalist>
            <div className="subtext" style={{ marginTop: "6px", marginBottom: 0 }}>
              {locationLoading ? "Searching locations..." : `${locationSuggestions.length} suggestions`}
            </div>
          </div>

          <div>
            <label className="label">Date Range</label>
            <div className="date-row">
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
          <button onClick={clearLocalFilters} className="secondary">
            Clear Filters
          </button>
          <button onClick={loadEvents} className="secondary">
            Reload All Events
          </button>
        </div>

        <div className="events-gallery">
          {loading ? (
            <div className="card">
              <h3>Loading events...</h3>
              <p className="subtext">Please wait while we fetch the latest events.</p>
            </div>
          ) : visibleEvents.length > 0 ? (
            visibleEvents.map((event) => (
              <div className="event-poster-card" key={event.eventId}>
                <div className="event-poster-media">
                  {event.wallpaperUrl ? (
                    <img
                      src={event.wallpaperUrl}
                      alt={`${event.title} wallpaper`}
                      className="event-poster-image"
                    />
                  ) : (
                    <div className={`event-theme ${getThemeClassFromCategory(event.category)}`}>
                      <div className="event-theme-label">{event.category || "Featured Event"}</div>
                    </div>
                  )}
                  <div className="event-poster-date">{formatDateTime(event.eventDate)}</div>
                </div>

                <div className="event-poster-content">
                  <div className="event-poster-title">{event.title}</div>
                  <div className="event-poster-location">{event.location}</div>
                  <div className="event-poster-meta">{event.category}</div>
                  <div className="event-poster-meta">₹{formatAmount(event.price)} per ticket</div>
                  <div className="event-poster-meta">Seats: {event.availableSeats}</div>

                  <button
                    className="event-poster-action"
                    onClick={() => navigate("/book", { state: { event } })}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="card empty-state">
              <h3>No events found</h3>
              <p>Try changing category, location, date, or search term.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default EventsPage;
