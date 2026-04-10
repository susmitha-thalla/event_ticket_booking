import api from "./api";
import { getAuthHeader } from "./authHeader";

export const bookTicket = async (data) => {
  try {
    const response = await api.post("/bookings/book", data, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return response.data;
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
    return retryResponse.data;
  }
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

export const getBookingsByEventId = async (eventId) => {
  const response = await api.get(`/bookings/event/${eventId}`);
  return response.data;
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
