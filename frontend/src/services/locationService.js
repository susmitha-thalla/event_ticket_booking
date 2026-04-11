import api from "./api";

const toLocationRecord = (item) => {
  if (!item || typeof item !== "object") return null;

  const city = String(item.city || item.location || item.name || "").trim();
  const district = String(item.district || "").trim();
  const mandal = String(item.mandal || item.tehsil || item.taluk || "").trim();
  const pincode = String(item.pincode || item.pinCode || item.postalCode || "").trim();
  const state = String(item.state || item.stateName || "").trim();

  if (!city) return null;

  const parts = [city, pincode, district, mandal, state].filter(Boolean);
  return {
    city,
    label: parts.join(" - "),
  };
};

const normalizeLocationPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload.map(toLocationRecord).filter(Boolean);
  }

  if (!payload || typeof payload !== "object") return [];

  const possibleArrays = [
    payload.locations,
    payload.results,
    payload.items,
    payload.content,
    payload.data,
    payload.data?.locations,
    payload.data?.results,
    payload.data?.items,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value.map(toLocationRecord).filter(Boolean);
    }
  }

  return [];
};

const fallbackFilter = (query, fallbackOptions = [], limit = 30) => {
  const normalized = String(query || "").trim().toLowerCase();
  if (!normalized) return fallbackOptions.slice(0, limit);

  return fallbackOptions
    .filter((item) => item.label.toLowerCase().startsWith(normalized))
    .slice(0, limit);
};

export const searchIndianLocations = async (query, fallbackOptions = [], limit = 30) => {
  const normalized = String(query || "").trim();
  if (!normalized) return fallbackOptions.slice(0, limit);

  const endpoint = import.meta.env.VITE_LOCATION_SEARCH_PATH || "/locations/search";

  try {
    const response = await api.get(endpoint, {
      params: { q: normalized, limit },
    });

    const remoteRecords = normalizeLocationPayload(response?.data);
    if (remoteRecords.length > 0) return remoteRecords.slice(0, limit);
  } catch {
    // Fallback to local index if remote location API isn't available.
  }

  return fallbackFilter(normalized, fallbackOptions, limit);
};

