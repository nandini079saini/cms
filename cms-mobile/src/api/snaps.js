import api from "./axiosInstance";

export const getAllSnaps = async () => {
  const response = await api.get("/api/snaps");
  return response.data;
};

export const uploadSnap = async (formData) => {
  const response = await api.post("/api/snaps", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const reactToSnap = async (snapId, customerId, reactionType) => {
  const response = await api.post(`/api/snaps/${snapId}/react`, {
    customer_id: customerId,
    reaction_type: reactionType,
  });
  return response.data;
};
