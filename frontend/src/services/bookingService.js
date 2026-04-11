import api from "./api";
import { getAuthHeader } from "./authHeader";

const FALLBACK_WRAPPER_KEYS = ["data", "payload", "result", "response"];
const FALLBACK_ARRAY_KEYS = ["bookings", "content", "items", "results", "list", "records"];

const normalizeBookingStatus = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  if (["CANCELED", "CANCELLED"].includes(normalized)) return "CANCELLED";
  if (!normalized) return "CONFIRMED";
  return normalized;
};

const extractArrayFromPayload = (payload, preferredKeys = [], depth = 0) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object" || depth > 4) return [];

  const keysToCheck = [...preferredKeys, ...FALLBACK_ARRAY_KEYS];
  for (const key of keysToCheck) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  for (const key of FALLBACK_WRAPPER_KEYS) {
    if (payload[key] !== undefined) {
      const nestedArray = extractArrayFromPayload(payload[key], preferredKeys, depth + 1);
      if (nestedArray.length > 0) return nestedArray;
    }
  }

  return [];
};

const normalizeBooking = (booking) => {
  if (!booking || typeof booking !== "object") return booking;

  const userObject =
    booking.user && typeof booking.user === "object"
      ? booking.user
      : {
          email: booking.userEmail || booking.email || "",
        };

  const eventObject =
    booking.event && typeof booking.event === "object"
      ? booking.event
      : {
          title: booking.eventTitle || booking.title || "",
          eventId: booking.eventId,
        };

  return {
    ...booking,
    bookingId: booking.bookingId ?? booking.id,
    bookingCode: booking.bookingCode ?? booking.code ?? "N/A",
    transactionCode: booking.transactionCode ?? booking.txnCode ?? "N/A",
    paymentStatus: booking.paymentStatus || booking.status || "PENDING",
    bookingStatus: normalizeBookingStatus(booking.bookingStatus || booking.status),
    seatNumbers: booking.seatNumbers || booking.seats || "N/A",
    user: userObject,
    event: eventObject,
  };
};

const requestFirstSuccessfulGet = async (endpointCandidates) => {
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

      if (status === 404 || status === 405) {
        if (!firstNotFoundError) firstNotFoundError = error;
        continue;
      }

      if (!firstOtherError) firstOtherError = error;
    }
  }

  throw firstAuthError || firstOtherError || firstNotFoundError || new Error("Request failed");
};

const parseBookingList = (payload) => {
  const list = extractArrayFromPayload(payload, ["bookings", "content", "items", "results"]);
  return list.map(normalizeBooking);
};

export const bookTicket = async (data) => {
  try {
    const response = await api.post("/bookings/book", data, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return normalizeBooking(response.data);
  } catch (error) {
    const status = error?.response?.status;
    if (status !== 401 && status !== 403) {
      throw error;
    }

    const retryResponse = await api.post("/bookings/book", data, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return normalizeBooking(retryResponse.data);
  }
};

export const getMyBookings = async () => {
  const payload = await requestFirstSuccessfulGet([
    "/bookings/my-bookings",
    "/bookings/user/my",
    "/bookings/user-bookings",
  ]);
  return parseBookingList(payload);
};

export const getOrganizerBookings = async () => {
  const payload = await requestFirstSuccessfulGet([
    "/bookings/organizer-bookings",
    "/bookings/organizer/all",
    "/organizer/bookings",
  ]);
  return parseBookingList(payload);
};

export const getAllBookings = async () => {
  const payload = await requestFirstSuccessfulGet([
    "/bookings/all",
    "/bookings/admin/all",
    "/admin/bookings/all",
    "/bookings",
  ]);
  return parseBookingList(payload);
};

export const getBookingsByEventId = async (eventId) => {
  const response = await api.get(`/bookings/event/${eventId}`);
  return parseBookingList(response.data);
};

export const cancelMyBooking = async (bookingId) => {
  const response = await api.put(`/bookings/cancel/${bookingId}`, null, {
    headers: {
      ...getAuthHeader(),
    },
  });
  return response.data;
};

export const cancelBookingByAdmin = async (bookingId) => {
  const response = await api.put(`/bookings/admin/cancel/${bookingId}`, null, {
    headers: {
      ...getAuthHeader(),
    },
  });
  return response.data;
};
