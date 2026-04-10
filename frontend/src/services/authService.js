import api from "./api";

export const registerUser = async (data) => {
  const response = await api.post("/users/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  try {
    const response = await api.post("/users/login", data);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const hasRole = Boolean(data?.role);

    if (hasRole && (status === 401 || status === 403)) {
      const { role, ...payloadWithoutRole } = data;
      const retryResponse = await api.post("/users/login", payloadWithoutRole);
      return retryResponse.data;
    }

    throw error;
  }
};
