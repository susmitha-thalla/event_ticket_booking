import api from "./api";

export const createSeatLayout = async (eventId, seatCodes) => {
  const response = await api.post(`/seats/layout/${eventId}`, {
    seatCodes,
  });
  return response.data;
};

export const getAvailableSeatsByEvent = async (eventId) => {
  const response = await api.get(`/seats/event/${eventId}/available`);
  return response.data;
};

export const getSeatMapByEvent = async (eventId) => {
  const response = await api.get(`/seats/event/${eventId}`);
  return response.data;
};
