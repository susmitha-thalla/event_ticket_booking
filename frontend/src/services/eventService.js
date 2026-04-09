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

export const getLiveEvents = async () => {
  const response = await api.get("/events/live");
  return response.data;
};

export const getUpcomingEvents = async () => {
  const response = await api.get("/events/upcoming");
  return response.data;
};

export const getCompletedEvents = async () => {
  const response = await api.get("/events/completed");
  return response.data;
};

export const getStartingSoonEvents = async () => {
  const response = await api.get("/events/starting-soon");
  return response.data;
};

export const getSeatBasedEvents = async () => {
  const response = await api.get("/events/seat-based");
  return response.data;
};

export const getNonSeatBasedEvents = async () => {
  const response = await api.get("/events/non-seat-based");
  return response.data;
};

export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/events/${eventId}`);
  return response.data;
};
