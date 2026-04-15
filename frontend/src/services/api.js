import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// =========================
// REQUEST INTERCEPTOR
// =========================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    const publicUrls = [
      "/users/register",
      "/users/login",

      "/events/all",
      "/events/live",
      "/events/upcoming",
      "/events/completed",
      "/events/starting-soon",
      "/events/seat-based",
      "/events/non-seat-based",
      "/events/filter",
      "/events/date",
      "/events/category/",
      "/events/location/",
      "/events/",

      "/seats/event/"
    ];

    const url = config.url || "";

    const isPublic = publicUrls.some((publicUrl) => url.includes(publicUrl));

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// RESPONSE INTERCEPTOR
// =========================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // logout only for invalid/expired token
    if (status === 401) {
      console.error("Unauthorized - token invalid or expired. Logging out.");

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");

      window.location.href = "/user/login";
    }

    // keep 403 for page-level handling
    return Promise.reject(error);
  }
);

export default api;