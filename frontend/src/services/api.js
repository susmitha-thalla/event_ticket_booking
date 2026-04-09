import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const getStoredToken = () => {
  const raw =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    "";

  const cleaned = raw.trim();
  if (!cleaned || cleaned === "undefined" || cleaned === "null") {
    return "";
  }

  return cleaned.toLowerCase().startsWith("bearer ")
    ? cleaned.slice(7).trim()
    : cleaned;
};

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  const publicUrls = [
    "/users/register",
    "/users/login",
    "/events/all",
    "/events/category/",
    "/events/location/",
    "/events/filter",
    "/events/date",
  ];

  const isPublic = publicUrls.some((url) => config.url?.includes(url));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      const existingToken = getStoredToken();
      if (existingToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("jwt");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
