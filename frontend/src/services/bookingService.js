import api from "./api";
import { getAuthHeader } from "./authHeader";

const FALLBACK_WRAPPER_KEYS = ["data", "payload", "result", "response", "body", "value"];
const FALLBACK_ARRAY_KEYS = [
  "bookings",
  "content",
  "items",
  "results",
  "list",
  "records",
  "bookingList",
  "bookingResponses",
  "rows",
];
const ONE_SEAT_LIMIT_PATTERNS = [
  /one user can book only one seat per booking/i,
  /one seat per booking/i,
  /book only one seat/i,
];

const normalizeString = (value) => String(value || "").trim();
const toNumeric = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeBookingStatus = (value) => {
  const normalized = normalizeString(value).toUpperCase();
  if (["CANCELED", "CANCELLED"].includes(normalized)) return "CANCELLED";
  if (!normalized) return "CONFIRMED";
  return normalized;
};

const splitSeatNumbers = (seatValue) => {
  const isValidSeatCode = (seat) => {
    const normalizedSeat = normalizeString(seat).toUpperCase();
    return Boolean(normalizedSeat) && normalizedSeat !== "N/A" && normalizedSeat !== "NA";
  };

  if (Array.isArray(seatValue)) {
    return seatValue
      .map((seat) => normalizeString(seat).toUpperCase())
      .filter(isValidSeatCode);
  }

  if (typeof seatValue === "string") {
    return seatValue
      .split(",")
      .map((seat) => normalizeString(seat).toUpperCase())
      .filter(isValidSeatCode);
  }

  return [];
};

const normalizeSeatNumbers = (booking = {}) => {
  const seatCandidates = [
    booking.seatNumbers,
    booking.seats,
    booking.seatCodes,
    booking.seatCode,
  ];

  for (const candidate of seatCandidates) {
    const seats = splitSeatNumbers(candidate);
    if (seats.length > 0) return seats.join(", ");
  }

  return "N/A";
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

const extractObjectFromPayload = (payload, depth = 0) => {
  if (Array.isArray(payload)) {
    return payload[0] && typeof payload[0] === "object" ? payload[0] : {};
  }

  if (!payload || typeof payload !== "object" || depth > 4) {
    return {};
  }

  const objectKeys = ["booking", "item", "record"];
  for (const key of objectKeys) {
    if (payload[key] && typeof payload[key] === "object") {
      return payload[key];
    }
  }

  for (const key of FALLBACK_WRAPPER_KEYS) {
    if (payload[key] !== undefined) {
      const nestedObject = extractObjectFromPayload(payload[key], depth + 1);
      if (nestedObject && Object.keys(nestedObject).length > 0) {
        return nestedObject;
      }
    }
  }

  return payload;
};

const getCurrentEmail = () => normalizeString(localStorage.getItem("email")).toLowerCase();

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
          createdBy: booking.createdBy || booking.eventCreatedBy || "",
        };

  const parsedSeatNumbers = normalizeSeatNumbers(booking);
  const seatCount = splitSeatNumbers(parsedSeatNumbers).length;
  const quantity = toNumeric(booking.quantity, seatCount);
  const totalAmount = toNumeric(booking.totalAmount, toNumeric(booking.amount, 0));

  return {
    ...booking,
    bookingId: booking.bookingId ?? booking.id,
    bookingCode: booking.bookingCode ?? booking.code ?? "N/A",
    transactionCode: booking.transactionCode ?? booking.txnCode ?? "N/A",
    paymentStatus: booking.paymentStatus || booking.status || "PENDING",
    bookingStatus: normalizeBookingStatus(booking.bookingStatus || booking.status),
    seatNumbers: parsedSeatNumbers,
    quantity,
    totalAmount,
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

      if (status === 400 || status === 404 || status === 405) {
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

const parseBookingObject = (payload) => normalizeBooking(extractObjectFromPayload(payload));

const dedupeBookings = (bookings = []) => {
  const uniqueMap = new Map();
  for (const booking of bookings) {
    const id = booking?.bookingId ?? booking?.id ?? booking?.bookingCode;
    if (id === null || id === undefined) continue;
    if (!uniqueMap.has(id)) uniqueMap.set(id, booking);
  }
  return Array.from(uniqueMap.values());
};

const filterBookingsForCurrentUser = (bookings = []) => {
  const email = getCurrentEmail();
  if (!email) return [];

  return bookings.filter((booking) => {
    const userEmail = normalizeString(
      booking?.user?.email || booking?.userEmail || booking?.email
    ).toLowerCase();
    return userEmail === email;
  });
};

const filterBookingsForCurrentOrganizer = (bookings = []) => {
  const email = getCurrentEmail();
  if (!email) return [];

  return bookings.filter((booking) => {
    const createdBy = normalizeString(
      booking?.event?.createdBy || booking?.createdBy || booking?.eventCreatedBy
    ).toLowerCase();
    return createdBy === email;
  });
};

const shouldTryPerEventFallback = (error) => {
  const status = error?.response?.status;
  if (!status) return true;
  return status >= 500 || status === 408 || status === 413 || status === 429;
};

const fetchBookingsForEvent = async (eventId, endpointCandidates = []) => {
  if (!eventId) return [];
  const payload = await requestFirstSuccessfulGet(endpointCandidates);
  const parsedBookings = parseBookingList(payload).filter((booking) => {
    const bookingEventId = booking?.event?.eventId ?? booking?.eventId;
    return String(bookingEventId) === String(eventId);
  });
  return parsedBookings;
};

const getAllBookingsViaEvents = async () => {
  const eventsPayload = await requestFirstSuccessfulGet(["/events/admin/all", "/events/all"]);
  const events = extractArrayFromPayload(eventsPayload, ["events", "content", "items", "results"]);
  const eventIds = [...new Set((events || []).map((event) => event?.eventId).filter(Boolean))];

  if (eventIds.length === 0) {
    return [];
  }

  const mergedBookings = [];
  let successfulEventRequests = 0;

  for (const eventId of eventIds) {
    try {
      const endpointCandidates = [
        `/bookings/event/${eventId}`,
        `/bookings/organizer-bookings/event/${eventId}`,
      ];
      const eventBookings = await fetchBookingsForEvent(eventId, endpointCandidates);
      successfulEventRequests += 1;
      mergedBookings.push(...eventBookings);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404 || status === 400) {
        continue;
      }
    }
  }

  if (successfulEventRequests === 0) {
    throw new Error("Unable to load bookings by event fallback");
  }

  return dedupeBookings(mergedBookings);
};

const getOrganizerBookingsViaEvents = async () => {
  const myEventsPayload = await requestFirstSuccessfulGet(["/events/my-events"]);
  const myEvents = extractArrayFromPayload(myEventsPayload, ["events", "content", "items", "results"]);
  const eventIds = [...new Set((myEvents || []).map((event) => event?.eventId).filter(Boolean))];

  if (eventIds.length === 0) {
    return [];
  }

  const mergedBookings = [];
  let successfulRequests = 0;

  for (const eventId of eventIds) {
    try {
      const endpointCandidates = [
        `/bookings/organizer-bookings/event/${eventId}`,
        `/bookings/event/${eventId}`,
      ];
      const eventBookings = await fetchBookingsForEvent(eventId, endpointCandidates);
      successfulRequests += 1;
      mergedBookings.push(...eventBookings);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404 || status === 400 || status === 403) {
        continue;
      }
    }
  }

  if (successfulRequests === 0) {
    throw new Error("Unable to load organizer bookings by event fallback");
  }

  return dedupeBookings(mergedBookings);
};

const readErrorMessage = (error) => {
  const dataMessage =
    normalizeString(error?.response?.data?.message) ||
    (typeof error?.response?.data === "string" ? normalizeString(error.response.data) : "");
  return dataMessage || normalizeString(error?.message);
};

const isSingleSeatLimitError = (error) => {
  const message = readErrorMessage(error);
  return ONE_SEAT_LIMIT_PATTERNS.some((pattern) => pattern.test(message));
};

const mergeBookingsForSuccess = (bookings = [], fallbackSeatNumbers = []) => {
  const normalizedBookings = bookings.map((booking) => normalizeBooking(booking));
  const firstBooking = normalizedBookings[0] || {};

  const seatFromBookings = normalizedBookings.flatMap((booking) =>
    splitSeatNumbers(booking?.seatNumbers)
  );
  const resolvedSeats =
    seatFromBookings.length > 0
      ? [...new Set(seatFromBookings)]
      : [...new Set(splitSeatNumbers(fallbackSeatNumbers))];

  const quantity = normalizedBookings.reduce(
    (sum, booking) => sum + Math.max(1, toNumeric(booking?.quantity, 1)),
    0
  );
  const totalAmount = normalizedBookings.reduce(
    (sum, booking) => sum + toNumeric(booking?.totalAmount, 0),
    0
  );

  const bookingIds = normalizedBookings
    .map((booking) => booking?.bookingId)
    .filter((value) => value !== undefined && value !== null);
  const bookingCodes = normalizedBookings
    .map((booking) => booking?.bookingCode)
    .filter(Boolean);

  const paymentStatus =
    normalizedBookings.every(
      (booking) => normalizeString(booking?.paymentStatus).toUpperCase() === "SUCCESS"
    )
      ? "SUCCESS"
      : firstBooking.paymentStatus || "PENDING";

  const bookingStatus =
    normalizedBookings.every(
      (booking) => normalizeString(booking?.bookingStatus).toUpperCase() === "CONFIRMED"
    )
      ? "CONFIRMED"
      : firstBooking.bookingStatus || "CONFIRMED";

  return {
    ...firstBooking,
    bookingId: bookingIds.length > 1 ? bookingIds.join(", ") : bookingIds[0] ?? firstBooking.bookingId,
    bookingCode:
      bookingCodes.length > 1
        ? `${bookingCodes.length} bookings`
        : bookingCodes[0] ?? firstBooking.bookingCode,
    quantity: quantity || resolvedSeats.length || firstBooking.quantity || 0,
    totalAmount,
    seatNumbers: resolvedSeats.length > 0 ? resolvedSeats.join(", ") : firstBooking.seatNumbers || "N/A",
    paymentStatus,
    bookingStatus,
    qrImagePath: normalizedBookings.length === 1 ? firstBooking.qrImagePath : "",
    individualBookings: normalizedBookings,
    isMultiBooking: normalizedBookings.length > 1,
  };
};

export const bookTicket = async (data) => {
  try {
    const response = await api.post("/bookings/book", data, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return parseBookingObject(response.data);
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
    return parseBookingObject(retryResponse.data);
  }
};

export const bookSeatSelection = async (data) => {
  const selectedSeats = splitSeatNumbers(data?.seatNumbers);
  if (selectedSeats.length === 0) {
    throw new Error("Please select at least one seat.");
  }

  const groupedPayload = {
    ...data,
    quantity: selectedSeats.length,
    seatNumbers: selectedSeats,
  };

  try {
    const groupedBooking = await bookTicket(groupedPayload);
    return mergeBookingsForSuccess([groupedBooking], selectedSeats);
  } catch (error) {
    if (!isSingleSeatLimitError(error)) {
      throw error;
    }
  }

  const successfulBookings = [];
  const failedSeats = [];

  for (const seatNumber of selectedSeats) {
    try {
      const singleSeatBooking = await bookTicket({
        ...data,
        quantity: 1,
        seatNumbers: [seatNumber],
      });
      successfulBookings.push(singleSeatBooking);
    } catch {
      failedSeats.push(seatNumber);
    }
  }

  if (successfulBookings.length === 0) {
    throw new Error("Unable to book selected seats. Please try again.");
  }

  const mergedBooking = mergeBookingsForSuccess(successfulBookings, selectedSeats);
  if (failedSeats.length > 0) {
    mergedBooking.warningMessage = `Booked ${successfulBookings.length} of ${selectedSeats.length} selected seats.`;
    mergedBooking.failedSeats = failedSeats;
  }

  return mergedBooking;
};

export const getMyBookings = async () => {
  try {
    const payload = await requestFirstSuccessfulGet([
      "/bookings/my-bookings",
      "/bookings/me",
      "/bookings/user-bookings",
    ]);
    return parseBookingList(payload);
  } catch {
    const fallbackPayload = await requestFirstSuccessfulGet([
      "/bookings/all",
      "/bookings/admin/all",
    ]);
    return filterBookingsForCurrentUser(parseBookingList(fallbackPayload));
  }
};

export const getOrganizerBookings = async () => {
  try {
    const payload = await requestFirstSuccessfulGet([
      "/bookings/organizer-bookings",
      "/bookings/organizer/all",
      "/organizer/bookings",
    ]);
    return parseBookingList(payload);
  } catch {
    try {
      return await getOrganizerBookingsViaEvents();
    } catch {
      const allBookingsPayload = await requestFirstSuccessfulGet([
        "/bookings/all",
        "/bookings/admin/all",
      ]);
      return filterBookingsForCurrentOrganizer(parseBookingList(allBookingsPayload));
    }
  }
};

export const getAllBookings = async () => {
  try {
    const payload = await requestFirstSuccessfulGet([
      "/bookings/all",
      "/bookings/admin/all",
      "/admin/bookings/all",
    ]);
    return parseBookingList(payload);
  } catch (error) {
    if (!shouldTryPerEventFallback(error)) {
      throw error;
    }

    return getAllBookingsViaEvents();
  }
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
