import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

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

export default api;