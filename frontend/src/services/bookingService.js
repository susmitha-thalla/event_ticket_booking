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
const QR_IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;
const USER_BOOKING_ENDPOINT_CANDIDATES = [
  "/bookings/my-bookings",
  "/bookings/user-bookings",
  "/bookings/my",
  "/bookings/my-booking",
  "/bookings/me/bookings",
  "/bookings/user/me",
  "/bookings/me",
  "/bookings/user",
  "/user/bookings",
  "/users/bookings",
];
const ORGANIZER_BOOKING_ENDPOINT_CANDIDATES = [
  "/bookings/organizer-bookings",
  "/bookings/organizer/all",
  "/organizer/bookings",
];
const ADMIN_BOOKING_ENDPOINT_CANDIDATES = [
  "/bookings/all",
  "/bookings/admin/all",
  "/admin/bookings/all",
  "/bookings",
];
const EVENT_LIST_ENDPOINT_CANDIDATES = [
  "/events/all",
  "/events/live",
  "/events/upcoming",
  "/events/admin/all",
];
const USER_BOOKINGS_CACHE_PREFIX = "ticket_booking_user_bookings_v2::";
const ADMIN_BOOKINGS_CACHE_KEY = "ticket_booking_admin_bookings_v2";

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
const toNumeric = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const hasBrowserStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);
const isAuthStatus = (status) => status === 401 || status === 403;
const parseJwtPayload = (token) => {
  const normalizedToken = normalizeString(token);
  if (!normalizedToken || !normalizedToken.includes(".")) return null;
  try {
    const base64Payload = normalizedToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      base64Payload + "=".repeat((4 - (base64Payload.length % 4)) % 4);
    const decoded =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const isLikelyBase64Image = (value) => {
  const normalized = normalizeString(value).replace(/\s+/g, "");
  if (normalized.length < 100) return false;
  if (!/^[A-Za-z0-9+/=]+$/.test(normalized)) return false;

  return (
    normalized.startsWith("iVBOR") ||
    normalized.startsWith("/9j/") ||
    normalized.startsWith("R0lGOD") ||
    normalized.startsWith("UklGR") ||
    normalized.startsWith("PHN2Zy") ||
    normalized.length % 4 === 0
  );
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

const normalizeQrImagePath = (booking = {}) => {
  const qrCandidates = [
    booking.qrImagePath,
    booking.qrImage,
    booking.qrCodeImage,
    booking.qrCode,
    booking.qrCodePath,
    booking.qrPath,
    booking.qrTicket,
    booking.qrTicketPath,
    booking.ticketQrImage,
  ];

  const normalizedCandidates = qrCandidates.flatMap((candidate) => {
    if (candidate && typeof candidate === "object") {
      return [
        candidate.url,
        candidate.path,
        candidate.src,
        candidate.value,
        candidate.data,
        candidate.base64,
      ];
    }
    return [candidate];
  });

  for (const candidate of normalizedCandidates) {
    const value = normalizeString(candidate).replace(/^["']|["']$/g, "");
    if (!value) continue;

    if (value.startsWith("data:image")) return value;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    if (isLikelyBase64Image(value)) return `data:image/png;base64,${value}`;

    if (
      value.startsWith("/") ||
      value.startsWith("./") ||
      value.startsWith("uploads/") ||
      value.startsWith("images/") ||
      value.startsWith("qrcode/") ||
      value.startsWith("qr/") ||
      value.startsWith("api/") ||
      QR_IMAGE_EXTENSIONS.test(value)
    ) {
      return buildAbsoluteUrlFromApiBase(value);
    }
  }

  return "";
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
  const parsed = parseMaybeJson(payload);
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== "object" || depth > 4) return [];

  const keysToCheck = [...preferredKeys, ...FALLBACK_ARRAY_KEYS];
  for (const key of keysToCheck) {
    if (Array.isArray(parsed[key])) return parsed[key];
  }

  for (const key of FALLBACK_WRAPPER_KEYS) {
    if (parsed[key] !== undefined) {
      const nestedArray = extractArrayFromPayload(parsed[key], preferredKeys, depth + 1);
      if (nestedArray.length > 0) return nestedArray;
    }
  }

  const objectArrayValues = Object.values(parsed).filter(Array.isArray);
  if (objectArrayValues.length > 0) {
    return objectArrayValues.sort((a, b) => b.length - a.length)[0];
  }

  return [];
};

const extractObjectFromPayload = (payload, depth = 0) => {
  const parsed = parseMaybeJson(payload);
  if (Array.isArray(parsed)) {
    return parsed[0] && typeof parsed[0] === "object" ? parsed[0] : {};
  }

  if (!parsed || typeof parsed !== "object" || depth > 4) {
    return {};
  }

  const objectKeys = ["booking", "item", "record"];
  for (const key of objectKeys) {
    if (parsed[key] && typeof parsed[key] === "object") {
      return parsed[key];
    }
  }

  for (const key of FALLBACK_WRAPPER_KEYS) {
    if (parsed[key] !== undefined) {
      const nestedObject = extractObjectFromPayload(parsed[key], depth + 1);
      if (nestedObject && Object.keys(nestedObject).length > 0) {
        return nestedObject;
      }
    }
  }

  return parsed;
};

const getCurrentEmail = () => {
  if (!hasBrowserStorage()) return "";
  const storedEmail = normalizeString(localStorage.getItem("email")).toLowerCase();
  if (storedEmail) return storedEmail;

  const rawToken =
    normalizeString(localStorage.getItem("token")) ||
    normalizeString(localStorage.getItem("accessToken")) ||
    normalizeString(localStorage.getItem("jwt"));
  const token = rawToken.toLowerCase().startsWith("bearer ")
    ? rawToken.slice(7).trim()
    : rawToken;

  const payload = parseJwtPayload(token);
  const tokenEmail = normalizeString(
    payload?.email || payload?.sub || payload?.username || payload?.userEmail
  ).toLowerCase();
  return tokenEmail;
};
const getUserBookingsCacheKey = () => {
  const email = getCurrentEmail();
  return email ? `${USER_BOOKINGS_CACHE_PREFIX}${email}` : "";
};

const readLocalStorageJson = (key, fallbackValue) => {
  if (!hasBrowserStorage() || !key) return fallbackValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackValue;
    const parsed = JSON.parse(raw);
    return parsed ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
};

const writeLocalStorageJson = (key, value) => {
  if (!hasBrowserStorage() || !key) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota or serialization errors
  }
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
    qrImagePath: normalizeQrImagePath(booking),
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

      if (isAuthStatus(status)) {
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

  throw firstOtherError || firstNotFoundError || firstAuthError || new Error("Request failed");
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

const normalizeBookingsList = (bookings = []) =>
  dedupeBookings((bookings || []).map((booking) => normalizeBooking(booking)).filter(Boolean));

const selectBestError = (errors = []) => {
  const normalizedErrors = (errors || []).filter(Boolean);
  if (normalizedErrors.length === 0) return new Error("Unable to load bookings right now.");

  const firstNonAuthError = normalizedErrors.find(
    (error) => !isAuthStatus(error?.response?.status)
  );
  return firstNonAuthError || normalizedErrors[0];
};

const resolveBookingsWithLoaders = async (loaders = []) => {
  const errors = [];
  let firstEmptyResult = null;

  for (const loader of loaders) {
    try {
      const result = normalizeBookingsList(await loader());
      if (result.length > 0) return result;
      if (firstEmptyResult === null) firstEmptyResult = result;
    } catch (error) {
      errors.push(error);
    }
  }

  if (firstEmptyResult !== null) return firstEmptyResult;
  throw selectBestError(errors);
};

const getCachedUserBookings = () => {
  const key = getUserBookingsCacheKey();
  const cached = readLocalStorageJson(key, []);
  return normalizeBookingsList(cached);
};

const setCachedUserBookings = (bookings = []) => {
  const key = getUserBookingsCacheKey();
  if (!key) return;
  writeLocalStorageJson(key, normalizeBookingsList(bookings));
};

const upsertCachedUserBookings = (bookings = []) => {
  const merged = normalizeBookingsList([...normalizeBookingsList(bookings), ...getCachedUserBookings()]);
  setCachedUserBookings(merged);
  return merged;
};

const getCachedAdminBookings = () => {
  const cached = readLocalStorageJson(ADMIN_BOOKINGS_CACHE_KEY, []);
  return normalizeBookingsList(cached);
};

const setCachedAdminBookings = (bookings = []) => {
  writeLocalStorageJson(ADMIN_BOOKINGS_CACHE_KEY, normalizeBookingsList(bookings));
};

const loadBookingsFromEndpoints = async (endpointCandidates = []) => {
  const payload = await requestFirstSuccessfulGet(endpointCandidates);
  return parseBookingList(payload);
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
  return (
    status >= 500 ||
    status === 400 ||
    status === 403 ||
    status === 404 ||
    status === 405 ||
    status === 408 ||
    status === 413 ||
    status === 429
  );
};

const buildEventBookingEndpointCandidates = (eventId) => [
  `/bookings/event/${eventId}`,
  `/bookings/events/${eventId}`,
  `/bookings/by-event/${eventId}`,
  `/bookings/event-bookings/${eventId}`,
  `/bookings/organizer-bookings/event/${eventId}`,
  `/organizer/bookings/event/${eventId}`,
  `/events/${eventId}/bookings`,
];

const fetchBookingsForEvent = async (eventId, endpointCandidates = []) => {
  if (!eventId) return [];
  const payload = await requestFirstSuccessfulGet(endpointCandidates);
  const parsedBookings = parseBookingList(payload).filter((booking) => {
    const bookingEventId = booking?.event?.eventId ?? booking?.eventId;
    return String(bookingEventId) === String(eventId);
  });
  return parsedBookings;
};

const getMergedEventIdsFromEndpoints = async (endpointCandidates = []) => {
  const eventIds = new Set();
  const errors = [];

  for (const endpoint of endpointCandidates) {
    try {
      const payload = await requestFirstSuccessfulGet([endpoint]);
      const events = extractArrayFromPayload(payload, ["events", "content", "items", "results"]);
      for (const event of events || []) {
        if (event?.eventId) eventIds.add(event.eventId);
      }
    } catch (error) {
      errors.push(error);
    }
  }

  if (eventIds.size > 0) {
    return Array.from(eventIds);
  }

  throw selectBestError(errors);
};

const getAllBookingsViaEvents = async () => {
  const eventIds = await getMergedEventIdsFromEndpoints(EVENT_LIST_ENDPOINT_CANDIDATES);

  if (eventIds.length === 0) {
    return [];
  }

  const mergedBookings = [];
  let successfulEventRequests = 0;

  for (const eventId of eventIds) {
    try {
      const endpointCandidates = buildEventBookingEndpointCandidates(eventId);
      const eventBookings = await fetchBookingsForEvent(eventId, endpointCandidates);
      successfulEventRequests += 1;
      mergedBookings.push(...eventBookings);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404 || status === 400 || status === 403 || status === 405) {
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
  const eventIds = await getMergedEventIdsFromEndpoints([
    "/events/my-events",
    "/organizer/events",
    "/events/organizer",
  ]);

  if (eventIds.length === 0) {
    return [];
  }

  const mergedBookings = [];
  let successfulRequests = 0;

  for (const eventId of eventIds) {
    try {
      const endpointCandidates = buildEventBookingEndpointCandidates(eventId);
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
  const qrImagePaths = [...new Set(
    normalizedBookings
      .map((booking) => normalizeString(booking?.qrImagePath))
      .filter(Boolean)
  )];
  const primaryQrImagePath = qrImagePaths[0] || "";

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
    qrImagePath: primaryQrImagePath,
    qrImagePaths,
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
    const booking = parseBookingObject(response.data);
    upsertCachedUserBookings([booking]);
    return booking;
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
    const booking = parseBookingObject(retryResponse.data);
    upsertCachedUserBookings([booking]);
    return booking;
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

  upsertCachedUserBookings(successfulBookings);
  return mergedBooking;
};

export const getMyBookings = async () => {
  const cachedBookings = getCachedUserBookings();
  const errors = [];

  try {
    const directBookings = await resolveBookingsWithLoaders([
      () => loadBookingsFromEndpoints(USER_BOOKING_ENDPOINT_CANDIDATES),
    ]);
    const merged = normalizeBookingsList([...directBookings, ...cachedBookings]);
    setCachedUserBookings(merged);
    return merged;
  } catch (error) {
    errors.push(error);
  }

  try {
    const fallbackBookings = await resolveBookingsWithLoaders([
      async () => filterBookingsForCurrentUser(await loadBookingsFromEndpoints(ADMIN_BOOKING_ENDPOINT_CANDIDATES)),
      async () => filterBookingsForCurrentUser(await getAllBookingsViaEvents()),
      async () => filterBookingsForCurrentUser(await getAllBookings()),
    ]);
    const merged = normalizeBookingsList([...fallbackBookings, ...cachedBookings]);
    setCachedUserBookings(merged);
    return merged;
  } catch (error) {
    errors.push(error);
  }

  if (cachedBookings.length > 0) {
    return cachedBookings;
  }

  throw selectBestError(errors);
};

export const getOrganizerBookings = async () => {
  return resolveBookingsWithLoaders([
    () => loadBookingsFromEndpoints(ORGANIZER_BOOKING_ENDPOINT_CANDIDATES),
    () => getOrganizerBookingsViaEvents(),
    async () => filterBookingsForCurrentOrganizer(await loadBookingsFromEndpoints(ADMIN_BOOKING_ENDPOINT_CANDIDATES)),
    async () => filterBookingsForCurrentOrganizer(await getAllBookingsViaEvents()),
  ]);
};

export const getAllBookings = async () => {
  const cachedAdminBookings = getCachedAdminBookings();
  const errors = [];

  try {
    const bookings = await resolveBookingsWithLoaders([
      () => loadBookingsFromEndpoints(ADMIN_BOOKING_ENDPOINT_CANDIDATES),
    ]);
    const merged = normalizeBookingsList([...bookings, ...cachedAdminBookings]);
    setCachedAdminBookings(merged);
    return merged;
  } catch (error) {
    errors.push(error);
    if (!shouldTryPerEventFallback(error) && cachedAdminBookings.length > 0) {
      return cachedAdminBookings;
    }
  }

  try {
    const bookingsViaEvents = await resolveBookingsWithLoaders([
      () => getAllBookingsViaEvents(),
    ]);
    const merged = normalizeBookingsList([...bookingsViaEvents, ...cachedAdminBookings]);
    setCachedAdminBookings(merged);
    return merged;
  } catch (error) {
    errors.push(error);
  }

  if (cachedAdminBookings.length > 0) {
    return cachedAdminBookings;
  }

  throw selectBestError(errors);
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
