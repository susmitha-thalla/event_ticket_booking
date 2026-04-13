import api from "./api";
import { getAuthHeader } from "./authHeader";

const WRAPPER_KEYS = ["data", "payload", "result", "response", "body", "value"];
const USER_ARRAY_KEYS = ["users", "content", "items", "results", "list", "records", "rows", "userList", "userResponses"];

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

  const keysToCheck = [...preferredKeys, ...USER_ARRAY_KEYS];
  for (const key of keysToCheck) {
    if (Array.isArray(parsed[key])) return parsed[key];
  }

  for (const key of WRAPPER_KEYS) {
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

const dedupeUsers = (users = []) => {
  const unique = new Map();
  for (const user of users || []) {
    if (!user || typeof user !== "object") continue;
    const key = String(user.userId ?? user.id ?? user.email ?? JSON.stringify(user));
    if (!unique.has(key)) unique.set(key, user);
  }
  return Array.from(unique.values());
};

const requestFirstSuccessfulGet = async (endpointCandidates = []) => {
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

  throw firstOtherError || firstNotFoundError || firstAuthError || new Error("Unable to load users.");
};

export const getAllUsers = async () => {
  const payload = await requestFirstSuccessfulGet([
    "/users/all",
    "/admin/users/all",
    "/users",
  ]);
  const users = extractArrayFromPayload(payload, ["users", "content", "items", "results"]);
  return dedupeUsers(users);
};
