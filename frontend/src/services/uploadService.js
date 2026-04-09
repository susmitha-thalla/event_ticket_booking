import api from "./api";
import { getAuthHeader } from "./authHeader";

export const uploadEventWallpaper = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/uploads/wallpaper", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...getAuthHeader(),
    },
  });

  return response.data;
};
