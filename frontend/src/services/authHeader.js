export const getAuthHeader = () => {
  const raw =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    "";

  const cleaned = raw.trim().replace(/^["']|["']$/g, "");
  if (!cleaned || cleaned === "undefined" || cleaned === "null") {
    return {};
  }

  const token = cleaned.toLowerCase().startsWith("bearer ")
    ? cleaned.slice(7).trim()
    : cleaned;

  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};
