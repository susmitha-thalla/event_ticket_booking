import api from "./api";

export const bookTicket = async (data) => {
  const response = await api.post("/bookings/book", data);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my-bookings");
  return response.data;
};

export const getOrganizerBookings = async () => {
  const response = await api.get("/bookings/organizer-bookings");
  return response.data;
};

export const getAllBookings = async () => {
  const response = await api.get("/bookings/all");
  return response.data;
};