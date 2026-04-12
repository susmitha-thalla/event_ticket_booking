import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createEvent, deleteEvent } from "../services/eventService";
import { createSeatLayout } from "../services/seatService";
import { uploadEventWallpaper } from "../services/uploadService";

const LAYOUT_OPTIONS = {
  SMALL: 50,
  MEDIUM: 150,
  LARGE: 200,
};
const CUSTOM_LAYOUT = "CUSTOM";
const MAX_CUSTOM_SEATS = 500;

const CATEGORY_OPTIONS = [
  "MUSIC",
  "STANDUP",
  "NIGHT",
  "CULTURAL",
  "TECH",
  "WORKSHOP",
  "SPORTS",
  "OTHER",
];

const getRowLabel = (rowIndex) => {
  let index = rowIndex + 1;
  let label = "";

  while (index > 0) {
    const remainder = (index - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    index = Math.floor((index - 1) / 26);
  }

  return label;
};

const generateSeatCodes = (seatCount) => {
  const perRow = 10;
  const seats = [];
  const rowCount = Math.ceil(seatCount / perRow);

  for (let row = 0; row < rowCount; row += 1) {
    const rowLabel = getRowLabel(row);
    for (let num = 1; num <= perRow; num += 1) {
      if (seats.length >= seatCount) break;
      seats.push(`${rowLabel}${num}`);
    }
  }

  return seats;
};

function CreateEventPage() {
  const navigate = useNavigate();
  const canUploadWallpapers = import.meta.env.VITE_ENABLE_WALLPAPER_UPLOAD !== "false";
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    wallpaperUrl: "",
    eventDate: "",
    price: "",
    availableSeats: "",
    hasSeats: false,
    recurrenceType: "NONE",
  });
  const [layoutSize, setLayoutSize] = useState("SMALL");
  const [customSeatCount, setCustomSeatCount] = useState("");
  const [wallpaperFile, setWallpaperFile] = useState(null);
  const [wallpaperPreview, setWallpaperPreview] = useState("");

  const selectedSeatCount = useMemo(() => {
    if (!form.hasSeats) return 0;
    if (layoutSize === CUSTOM_LAYOUT) return Number(customSeatCount);
    return LAYOUT_OPTIONS[layoutSize];
  }, [form.hasSeats, layoutSize, customSeatCount]);

  const generatedSeats = useMemo(() => {
    if (!form.hasSeats) return [];
    if (!Number.isInteger(selectedSeatCount) || selectedSeatCount < 1) return [];
    return generateSeatCodes(selectedSeatCount);
  }, [form.hasSeats, selectedSeatCount]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;
    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (form.hasSeats && generatedSeats.length === 0) {
      if (layoutSize === CUSTOM_LAYOUT) {
        alert("Please enter a custom seat count greater than 0.");
      } else {
        alert("Please select seat layout size for a seat-based event.");
      }
      return;
    }

    if (form.hasSeats && layoutSize === CUSTOM_LAYOUT && selectedSeatCount > MAX_CUSTOM_SEATS) {
      alert(`Custom seat count cannot exceed ${MAX_CUSTOM_SEATS}.`);
      return;
    }

    const availableSeats = form.hasSeats
      ? generatedSeats.length
      : Number(form.availableSeats);

    if (!availableSeats || Number(availableSeats) <= 0) {
      alert("Available seats must be greater than 0.");
      return;
    }

    try {
      let finalWallpaperUrl = form.wallpaperUrl.trim();

      if (wallpaperFile && canUploadWallpapers) {
        try {
          const uploaded = await uploadEventWallpaper(wallpaperFile);
          finalWallpaperUrl = uploaded?.url || finalWallpaperUrl;
        } catch (uploadError) {
          const uploadStatus = uploadError?.response?.status;
          if (uploadStatus !== 403) {
            throw uploadError;
          }
        }
      }

      if (!finalWallpaperUrl) {
        finalWallpaperUrl = `https://picsum.photos/seed/${encodeURIComponent(
          form.title || "event"
        )}/1200/600`;
      }

      const basePayload = {
        title: form.title,
        description: form.description,
        location: form.location,
        category: form.category,
        wallpaperUrl: finalWallpaperUrl,
        eventDate: form.eventDate,
        price: Number(form.price),
        availableSeats,
        hasSeats: Boolean(form.hasSeats),
        recurrenceType: form.recurrenceType || "NONE",
      };

      const createdEvent = await createEvent(basePayload);

      if (form.hasSeats && !createdEvent?.eventId) {
        throw new Error("Event created but eventId was not returned. Please update backend create-event response.");
      }

      if (form.hasSeats) {
        try {
          await createSeatLayout(createdEvent.eventId, generatedSeats);
        } catch (seatErr) {
          const seatStatus = seatErr?.response?.status;

          if (seatStatus === 401) {
            alert("Session expired while saving seat layout. Please login again.");
            navigate("/organizer/login");
            return;
          }

          if (seatStatus === 403 || seatStatus === 404) {
            // If deployed backend doesn't support seat-layout endpoint yet,
            // create a non-seat event fallback so organizer can still proceed.
            try {
              await deleteEvent(createdEvent.eventId);
            } catch {
              // ignore cleanup failure
            }

            await createEvent({
              ...basePayload,
              hasSeats: false,
              availableSeats: generatedSeats.length,
            });

            alert(
              "Seat-layout API is unavailable on current backend deployment. " +
              `Created event as non-seat event with ${generatedSeats.length} tickets.`
            );

            setForm({
              title: "",
              description: "",
              location: "",
              category: "",
              wallpaperUrl: "",
              eventDate: "",
              price: "",
              availableSeats: "",
              hasSeats: false,
              recurrenceType: "NONE",
            });
            setLayoutSize("SMALL");
            setCustomSeatCount("");
            setWallpaperFile(null);
            setWallpaperPreview("");
            return;
          }

          throw seatErr;
        }
      }

      alert("Event created successfully and sent for admin approval.");

      setForm({
        title: "",
        description: "",
        location: "",
        category: "",
        wallpaperUrl: "",
        eventDate: "",
        price: "",
        availableSeats: "",
        hasSeats: false,
        recurrenceType: "NONE",
      });
      setLayoutSize("SMALL");
      setCustomSeatCount("");
      setWallpaperFile(null);
      setWallpaperPreview("");
    } catch (error) {
      console.error(error);
      const status = error?.response?.status;
      const errorMessage = error?.message || "";
      const backendMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string" ? error.response.data : "") ||
        error.message;

      const looksLikeAuthError =
        status === 401 ||
        /status code 401/i.test(errorMessage) ||
        /unauthorized/i.test(errorMessage);

      if (looksLikeAuthError) {
        alert(`Authorization failed (${status}). Please login again as organizer.`);
        navigate("/organizer/login");
        return;
      }

      if (status === 403) {
        alert(
          "Forbidden (403): your account/token is valid for login but not allowed to create events. " +
          "Login with organizer account and try again."
        );
        return;
      }

      alert(backendMessage || "Event creation failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2>Create Event</h2>
          <form onSubmit={handleCreate}>
            <input name="title" placeholder="Title" onChange={handleChange} required />
            <input
              name="description"
              placeholder="Description (max 255 chars)"
              maxLength={255}
              onChange={handleChange}
              required
            />
            <input name="location" placeholder="Location" onChange={handleChange} required />
            <select
              className="select-field"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              type="url"
              name="wallpaperUrl"
              placeholder="Event Wallpaper URL (optional)"
              value={form.wallpaperUrl}
              onChange={handleChange}
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
              <div className="subtext">
                Wallpaper upload is disabled for this deployment. Use Wallpaper URL instead.
              </div>
            )}
            {(wallpaperPreview || form.wallpaperUrl) ? (
              <img
                src={wallpaperPreview || form.wallpaperUrl}
                alt="Event wallpaper preview"
                style={{ width: "100%", height: "170px", objectFit: "cover", borderRadius: "12px" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}
            <input
              type="datetime-local"
              name="eventDate"
              value={form.eventDate}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              min="1"
              step="0.01"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              required
            />

            <label className="label" style={{ marginTop: "8px", display: "block" }}>
              <input
                type="checkbox"
                name="hasSeats"
                checked={form.hasSeats}
                onChange={handleChange}
                style={{ marginRight: "8px" }}
              />
              Seat-based Event
            </label>

            <select
              className="select-field"
              name="recurrenceType"
              value={form.recurrenceType}
              onChange={handleChange}
            >
              <option value="NONE">No Recurrence</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>

            {form.hasSeats ? (
              <>
                <select
                  className="select-field"
                  value={layoutSize}
                  onChange={(e) => setLayoutSize(e.target.value)}
                >
                  <option value="SMALL">Small Layout (50 seats)</option>
                  <option value="MEDIUM">Medium Layout (150 seats)</option>
                  <option value="LARGE">Large Layout (200 seats)</option>
                  <option value={CUSTOM_LAYOUT}>Custom Seat Count</option>
                </select>
                {layoutSize === CUSTOM_LAYOUT && (
                  <input
                    type="number"
                    min="1"
                    max={MAX_CUSTOM_SEATS}
                    step="1"
                    placeholder="Enter custom seats (e.g. 2, 10, 15)"
                    value={customSeatCount}
                    onChange={(e) => setCustomSeatCount(e.target.value)}
                    required
                  />
                )}
                <div className="subtext">Auto-generated seats: {generatedSeats.length}</div>
                <div className="subtext">
                  Preview: {generatedSeats.slice(0, 20).join(", ")}
                  {generatedSeats.length > 20 ? " ..." : ""}
                </div>
                <input
                  name="availableSeats"
                  value={generatedSeats.length}
                  readOnly
                  placeholder="Available Seats"
                />
              </>
            ) : (
              <input
                type="number"
                min="1"
                name="availableSeats"
                placeholder="Available Tickets"
                value={form.availableSeats}
                onChange={handleChange}
                required
              />
            )}

            <button type="submit">Create Event</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateEventPage;
