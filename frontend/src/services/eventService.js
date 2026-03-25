import api from "./api";

export const getAllEvents = async () => {
  const response = await api.get("/events/all");
  return response.data;
};

export const getEventsByCategory = async (category) => {
  const response = await api.get(`/events/category/${category}`);
  return response.data;
};

export const getEventsByLocation = async (location) => {
  const response = await api.get(`/events/location/${location}`);
  return response.data;
};

export const getEventsByDate = async (start, end) => {
  const response = await api.get(`/events/date?start=${start}&end=${end}`);
  return response.data;
};

export const createEvent = async (data) => {
  const response = await api.post("/events/create", data);
  return response.data;
};

export const getMyEvents = async () => {
  const response = await api.get("/events/my-events");
  return response.data;
};

export const getAdminAllEvents = async () => {
  const response = await api.get("/events/admin/all");
  return response.data;
};

export const approveEvent = async (eventId) => {
  const response = await api.post(`/events/approve/${eventId}`);
  return response.data;
};