import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { cancelEvent, getMyEvents, updateEvent } from "../services/eventService";
import { uploadEventWallpaper } from "../services/uploadService";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const timezoneOffsetMs = parsed.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(parsed.getTime() - timezoneOffsetMs);
  return localDate.toISOString().slice(0, 16);
};

const normalizeStatus = (value) => String(value || "").trim().toUpperCase();
const toNumeric = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const isSeatsCompleted = (event) => toNumeric(event?.availableSeats, 0) <= 0;
const isEventCancelled = (event) => {
  const status = normalizeStatus(event?.eventStatus || event?.status);
  return (
    Boolean(event?.isDeleted) ||
    status === "CANCELLED" ||
    status === "CANCELED" ||
    status === "DELETED"
  );
};

function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeEditId, setActiveEditId] = useState(null);
  const [wallpaperFile, setWallpaperFile] = useState(null);
  const [wallpaperPreview, setWallpaperPreview] = useState("");
  const [editForm, setEditForm] = useState({
    location: "",
    eventDate: "",
    availableSeats: "",
    wallpaperUrl: "",
  });
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const canUploadWallpapers = import.meta.env.VITE_ENABLE_WALLPAPER_UPLOAD !== "false";

  const isEventCompleted = (event) => {
    if (!event) return false;
    const status = normalizeStatus(event.eventStatus || event.status);
    if (status === "COMPLETED" || status === "ENDED") return true;
    if (isSeatsCompleted(event)) return true;
    if (!event.eventDate) return false;
    const eventDate = new Date(event.eventDate);
    if (Number.isNaN(eventDate.getTime())) return false;
    return eventDate.getTime() < Date.now();
  };

  const loadEvents = async () => {
    try {
      setErrorMessage("");
      const data = await getMyEvents();
      setEvents(data || []);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load organizer events.");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCancelEvent = async (eventId) => {
    const allowCancel = window.confirm(
      "Cancel this event? Users will no longer be able to book it."
    );
    if (!allowCancel) return;

    try {
      setSubmitting(true);
      setErrorMessage("");
      setInfoMessage("");
      await cancelEvent(eventId);
      setEvents((previous) =>
        previous.map((event) =>
          event.eventId === eventId
            ? {
                ...event,
                isDeleted: true,
                eventStatus: "CANCELLED",
                status: "CANCELLED",
                approvalStatus: event.approvalStatus || "APPROVED",
              }
            : event
        )
      );
      setInfoMessage("Event cancelled successfully.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error?.response?.data || "Unable to cancel event right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (event) => {
    setErrorMessage("");
    setInfoMessage("");
    setActiveEditId(event.eventId);
    setWallpaperFile(null);
    setWallpaperPreview("");
    setEditForm({
      location: event.location || "",
      eventDate: toDateTimeLocal(event.eventDate),
      availableSeats: String(toNumeric(event.availableSeats, 0)),
      wallpaperUrl: event.wallpaperUrl || "",
    });
  };

  const resetEditState = () => {
    setActiveEditId(null);
    setWallpaperFile(null);
    setWallpaperPreview("");
    setEditForm({
      location: "",
      eventDate: "",
      availableSeats: "",
      wallpaperUrl: "",
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateEvent = async (eventId) => {
    const seatsValue = Number(editForm.availableSeats);
    if (!Number.isFinite(seatsValue) || seatsValue < 0) {
      setErrorMessage("Available seats should be 0 or more.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setInfoMessage("");

      let finalWallpaperUrl = editForm.wallpaperUrl.trim();
      if (wallpaperFile && canUploadWallpapers) {
        const uploaded = await uploadEventWallpaper(wallpaperFile);
        finalWallpaperUrl = uploaded?.url || finalWallpaperUrl;
      }

      const payload = {
        location: editForm.location.trim(),
        eventDate: editForm.eventDate,
        availableSeats: seatsValue,
        wallpaperUrl: finalWallpaperUrl,
      };
      const updatedEvent = await updateEvent(eventId, payload);

      setEvents((previous) =>
        previous.map((event) =>
          event.eventId === eventId
            ? {
                ...event,
                ...payload,
                ...updatedEvent,
                availableSeats: seatsValue,
                eventDate: editForm.eventDate,
                wallpaperUrl: finalWallpaperUrl || event.wallpaperUrl,
              }
            : event
        )
      );

      setInfoMessage("Event updated successfully.");
      resetEditState();
    } catch (error) {
      console.error(error);
      const backendMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string" ? error?.response?.data : "");
      setErrorMessage(backendMessage || "Unable to update event right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const upcomingEvents = events.filter((event) => !isEventCancelled(event) && !isEventCompleted(event));
  const completedEvents = events.filter(
    (event) => !isEventCancelled(event) && isEventCompleted(event)
  );
  const cancelledEvents = events.filter((event) => isEventCancelled(event));
  const activeTab = useMemo(() => {
    const tab = searchParams.get("tab") || "upcoming";
    if (tab === "deleted") return "cancelled";
    return tab;
  }, [searchParams]);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const getStatusBadgeClass = (event) => {
    if (isEventCancelled(event)) return "badge rejected";
    if (isSeatsCompleted(event)) return "badge pending";
    return "badge approved";
  };

  const getStatusLabel = (event) => {
    if (isEventCancelled(event)) return "CANCELLED";
    if (isSeatsCompleted(event)) return "SOLD OUT";
    if (isEventCompleted(event)) return "COMPLETED";
    return normalizeStatus(event?.eventStatus) || "UPCOMING";
  };

  const renderEventCard = (event, options = {}) => (
    <div className="card" key={event.eventId}>
      {event.wallpaperUrl ? (
        <img
          src={event.wallpaperUrl}
          alt={`${event.title} wallpaper`}
          style={{
            width: "100%",
            height: "180px",
            objectFit: "cover",
            borderRadius: "12px",
            marginBottom: "12px",
          }}
        />
      ) : null}
      <h3>{event.title}</h3>
      <p className="subtext">{event.description}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Category:</strong> {event.category}</p>
      <p><strong>Date:</strong> {formatDateTime(event.eventDate)}</p>
      <p><strong>Price:</strong> ₹{event.price}</p>
      <p><strong>Seats:</strong> {event.availableSeats}</p>
      {isSeatsCompleted(event) && !isEventCancelled(event) && (
        <p><strong>Seat Status:</strong> SOLD OUT</p>
      )}
      <p><strong>Status:</strong> {getStatusLabel(event)}</p>

      <span
        className={`badge ${
          event.approvalStatus === "APPROVED" ? "approved" : "pending"
        }`}
      >
        {event.approvalStatus}
      </span>
      <span className={getStatusBadgeClass(event)} style={{ marginLeft: "8px" }}>
        {getStatusLabel(event)}
      </span>

      {!options.isCancelledList && (
        <div style={{ marginTop: "10px" }}>
          <button
            type="button"
            className="secondary"
            onClick={() => startEditing(event)}
            disabled={submitting}
            style={{ marginRight: "8px" }}
          >
            Edit Event
          </button>
          <button
            className="danger"
            onClick={() => handleCancelEvent(event.eventId)}
            disabled={submitting}
          >
            Cancel Event
          </button>
        </div>
      )}

      {activeEditId === event.eventId && (
        <div className="card" style={{ marginTop: "14px", background: "#f8fbff" }}>
          <h3 style={{ marginBottom: "8px" }}>Update Event Details</h3>
          <input
            name="location"
            placeholder="Location"
            value={editForm.location}
            onChange={handleEditFormChange}
          />
          <input
            type="datetime-local"
            name="eventDate"
            value={editForm.eventDate}
            onChange={handleEditFormChange}
          />
          <input
            type="number"
            min="0"
            step="1"
            name="availableSeats"
            placeholder="Available Seats"
            value={editForm.availableSeats}
            onChange={handleEditFormChange}
          />
          <input
            type="url"
            name="wallpaperUrl"
            placeholder="Wallpaper URL"
            value={editForm.wallpaperUrl}
            onChange={handleEditFormChange}
          />
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setWallpaperFile(file || null);
              if (file) {
                setWallpaperPreview(URL.createObjectURL(file));
              } else {
                setWallpaperPreview("");
              }
            }}
          />
          {!canUploadWallpapers && (
            <div className="subtext" style={{ marginBottom: "0" }}>
              Wallpaper upload is disabled for this deployment. Use Wallpaper URL.
            </div>
          )}
          {(wallpaperPreview || editForm.wallpaperUrl) && (
            <img
              src={wallpaperPreview || editForm.wallpaperUrl}
              alt="Wallpaper preview"
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "12px",
                marginTop: "10px",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
            <button type="button" onClick={() => handleUpdateEvent(event.eventId)} disabled={submitting}>
              Save Changes
            </button>
            <button type="button" className="secondary" onClick={resetEditState} disabled={submitting}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>My Events</h2>
        {infoMessage && <div className="message-success">{infoMessage}</div>}
        {errorMessage && <div className="message-error">{errorMessage}</div>}

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          <button
            type="button"
            className={activeTab === "upcoming" ? "" : "secondary"}
            onClick={() => setTab("upcoming")}
          >
            Upcoming ({upcomingEvents.length})
          </button>
          <button
            type="button"
            className={activeTab === "completed" ? "" : "secondary"}
            onClick={() => setTab("completed")}
          >
            Completed ({completedEvents.length})
          </button>
          <button
            type="button"
            className={activeTab === "cancelled" ? "danger" : "secondary"}
            onClick={() => setTab("cancelled")}
          >
            Cancelled ({cancelledEvents.length})
          </button>
        </div>

        {activeTab === "upcoming" && (
          <>
            <h3>Upcoming Events ({upcomingEvents.length})</h3>
            {upcomingEvents.length === 0 ? (
              <div className="card empty-state">
                <p>No upcoming events.</p>
              </div>
            ) : (
              upcomingEvents.map((event) => renderEventCard(event))
            )}
          </>
        )}

        {activeTab === "completed" && (
          <>
            <h3>Completed Events ({completedEvents.length})</h3>
            {completedEvents.length === 0 ? (
              <div className="card empty-state">
                <p>No completed events.</p>
              </div>
            ) : (
              completedEvents.map((event) => renderEventCard(event))
            )}
          </>
        )}

        {activeTab === "cancelled" && (
          <>
            <h3>Cancelled Events ({cancelledEvents.length})</h3>
            {cancelledEvents.length === 0 ? (
              <div className="card empty-state">
                <p>No cancelled events.</p>
              </div>
            ) : (
              cancelledEvents.map((event) => renderEventCard(event, { isCancelledList: true }))
            )}
          </>
        )}
      </div>
    </>
  );
}

export default MyEventsPage;
