import api from "./api";

export const uploadEventWallpaper = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/uploads/wallpaper", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
