import api from "./api";
import { getAuthHeader } from "./authHeader";

const WRAPPER_KEYS = ["data", "payload", "result", "response", "body", "value"];
const EVENT_ARRAY_KEYS = ["events", "content", "items", "results", "list", "records", "rows"];
const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;

const normalizeString = (value) => String(value || "").trim();

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text) return value;
  const looksLikeJson =
    (text.startsWith("{") && text.endsWith("}")) ||
    (text.startsWith("[") && text.endsWith("]"));
  if (!looksLikeJson) return value;
  try {
    return JSON.parse(text);
  } catch {
    return value;
  }
};

const extractArrayFromPayload = (payload, preferredKeys = [], depth = 0) => {
  const parsed = parseMaybeJson(payload);
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== "object" || depth > 5) return [];

  const keysToCheck = [...preferredKeys, ...EVENT_ARRAY_KEYS];
  for (const key of keysToCheck) {
    if (Array.isArray(parsed[key])) return parsed[key];
  }

  for (const key of WRAPPER_KEYS) {
    if (parsed[key] !== undefined) {
      const nestedArray = extractArrayFromPayload(parsed[key], preferredKeys, depth + 1);
      if (nestedArray.length > 0) return nestedArray;
    }
  }

  const arrayValues = Object.values(parsed).filter(Array.isArray);
  if (arrayValues.length > 0) {
    return arrayValues.sort((a, b) => b.length - a.length)[0];
  }

  return [];
};

const buildAbsoluteUrlFromApiBase = (pathValue) => {
  const normalizedPath = normalizeString(pathValue).replace(/\\/g, "/");
  if (!normalizedPath) return "";

  const apiBase = normalizeString(import.meta.env.VITE_API_BASE_URL);
  if (!apiBase) return normalizedPath;

  try {
    const apiUrl = new URL(apiBase);
    const origin = `${apiUrl.protocol}//${apiUrl.host}`;

    if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
      return normalizedPath;
    }

    if (normalizedPath.startsWith("/")) {
      return `${origin}${normalizedPath}`;
    }

    return `${origin}/${normalizedPath.replace(/^\.?\//, "")}`;
  } catch {
    return normalizedPath;
  }
};

const normalizeWallpaperUrl = (event = {}) => {
  const candidates = [
    event.wallpaperUrl,
    event.wallpaper,
    event.posterUrl,
    event.bannerUrl,
    event.imageUrl,
    event.image,
  ];

  for (const candidate of candidates) {
    const value = normalizeString(candidate).replace(/^["']|["']$/g, "");
    if (!value) continue;
    if (value.startsWith("data:image")) return value;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    if (
      value.startsWith("/") ||
      value.startsWith("./") ||
      value.startsWith("uploads/") ||
      value.startsWith("images/") ||
      value.startsWith("api/") ||
      IMAGE_EXTENSIONS.test(value)
    ) {
      return buildAbsoluteUrlFromApiBase(value);
    }
  }

  return "";
};

const normalizeEvent = (event) => {
  if (!event || typeof event !== "object") return event;
  return {
    ...event,
    eventId: event.eventId ?? event.id,
    wallpaperUrl: normalizeWallpaperUrl(event),
  };
};

const dedupeEvents = (events = []) => {
  const unique = new Map();
  for (const event of events || []) {
    if (!event || typeof event !== "object") continue;
    const normalizedEvent = normalizeEvent(event);
    const id = normalizedEvent.eventId ?? normalizedEvent.code;
    const key = id === null || id === undefined ? JSON.stringify(normalizedEvent) : String(id);
    if (!unique.has(key)) unique.set(key, normalizedEvent);
  }
  return Array.from(unique.values());
};

const parseEventList = (payload) =>
  dedupeEvents(extractArrayFromPayload(payload, ["events", "content", "items", "results"]));

const requestFirstSuccessfulEventGet = async (endpointCandidates = []) => {
  const headers = {
    ...getAuthHeader(),
  };

  let firstAuthError = null;
  let firstNotFoundError = null;
  let firstOtherError = null;

  for (const endpoint of endpointCandidates) {
    try {
      const response = await api.get(endpoint, { headers });
      return response.data;
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        if (!firstAuthError) firstAuthError = error;
        continue;
      }

      if (status === 400 || status === 404 || status === 405) {
        if (!firstNotFoundError) firstNotFoundError = error;
        continue;
      }

      if (!firstOtherError) firstOtherError = error;
    }
  }

  throw firstOtherError || firstNotFoundError || firstAuthError || new Error("Unable to load events.");
};

const getEventsFromCandidates = async (endpointCandidates = []) => {
  const payload = await requestFirstSuccessfulEventGet(endpointCandidates);
  return parseEventList(payload);
};

const isCompletedEvent = (event) => {
  const status = normalizeString(event?.eventStatus).toUpperCase();
  if (status === "COMPLETED" || status === "ENDED") return true;

  const eventDate = new Date(event?.eventDate);
  if (Number.isNaN(eventDate.getTime())) return false;
  return eventDate.getTime() < Date.now();
};

const isDeletedEvent = (event) => {
  const status = normalizeString(event?.eventStatus).toUpperCase();
  return Boolean(event?.isDeleted) || status === "DELETED" || status === "CANCELLED" || status === "CANCELED";
};

export const getAllEvents = async () =>
  getEventsFromCandidates(["/events/all", "/events/live", "/events/upcoming", "/events"]);

export const getEventsByCategory = async (category) =>
  getEventsFromCandidates([`/events/category/${category}`, `/events/all`]).then((events) => {
    if (events.length > 0 && events.some((event) => normalizeString(event?.category))) {
      return events.filter(
        (event) =>
          normalizeString(event?.category).toUpperCase() === normalizeString(category).toUpperCase()
      );
    }
    return events;
  });

export const getEventsByLocation = async (location) =>
  getEventsFromCandidates([`/events/location/${location}`, "/events/all"]).then((events) => {
    if (events.length > 0 && events.some((event) => normalizeString(event?.location))) {
      const target = normalizeString(location).toLowerCase();
      return events.filter((event) => normalizeString(event?.location).toLowerCase().includes(target));
    }
    return events;
  });

export const getEventsByDate = async (start, end) =>
  getEventsFromCandidates([`/events/date?start=${start}&end=${end}`, "/events/all"]).then((events) => {
    if (!start && !end) return events;

    const startDate = start ? new Date(`${start}T00:00:00`) : null;
    const endDate = end ? new Date(`${end}T23:59:59`) : null;

    return events.filter((event) => {
      const eventDate = new Date(event?.eventDate);
      if (Number.isNaN(eventDate.getTime())) return false;
      if (startDate && eventDate < startDate) return false;
      if (endDate && eventDate > endDate) return false;
      return true;
    });
  });

export const createEvent = async (data) => {
  const response = await api.post("/events/create", data, {
    headers: {
      ...getAuthHeader(),
    },
  });
  return response.data;
};

export const getMyEvents = async () =>
  getEventsFromCandidates([
    "/events/my-events",
    "/organizer/events",
    "/events/organizer",
    "/events/created-by-me",
  ]);

export const getAdminAllEvents = async () =>
  getEventsFromCandidates(["/events/admin/all", "/events/all"]);

export const approveEvent = async (eventId) => {
  const response = await api.post(`/events/approve/${eventId}`, null, {
    headers: {
      ...getAuthHeader(),
    },
  });
  return response.data;
};

export const getLiveEvents = async () => {
  try {
    return await getEventsFromCandidates(["/events/live"]);
  } catch {
    const all = await getAllEvents();
    return all.filter((event) => normalizeString(event?.eventStatus).toUpperCase() === "LIVE");
  }
};

export const getUpcomingEvents = async () => {
  try {
    return await getEventsFromCandidates(["/events/upcoming"]);
  } catch {
    const all = await getAllEvents();
    return all.filter((event) => !isDeletedEvent(event) && !isCompletedEvent(event));
  }
};

export const getCompletedEvents = async () => {
  try {
    return await getEventsFromCandidates(["/events/completed"]);
  } catch {
    const all = await getAllEvents();
    return all.filter((event) => !isDeletedEvent(event) && isCompletedEvent(event));
  }
};

export const getStartingSoonEvents = async () => {
  try {
    return await getEventsFromCandidates(["/events/starting-soon"]);
  } catch {
    const all = await getUpcomingEvents();
    const now = Date.now();
    const within48Hours = now + 48 * 60 * 60 * 1000;
    return all.filter((event) => {
      const eventDate = new Date(event?.eventDate);
      if (Number.isNaN(eventDate.getTime())) return false;
      return eventDate.getTime() >= now && eventDate.getTime() <= within48Hours;
    });
  }
};

export const getSeatBasedEvents = async () => {
  try {
    return await getEventsFromCandidates(["/events/seat-based"]);
  } catch {
    const all = await getAllEvents();
    return all.filter((event) => event?.hasSeats === true || event?.hasSeats === "true");
  }
};

export const getNonSeatBasedEvents = async () => {
  try {
    return await getEventsFromCandidates(["/events/non-seat-based"]);
  } catch {
    const all = await getAllEvents();
    return all.filter((event) => !(event?.hasSeats === true || event?.hasSeats === "true"));
  }
};

export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/events/${eventId}`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  return response.data;
};
