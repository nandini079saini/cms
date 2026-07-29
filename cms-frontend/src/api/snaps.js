import api from "./axiosInstance";

export const getAllSnaps = () => api.get("/api/snaps");

export const uploadSnap = (formData) =>
  api.post("/api/snaps", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const reactToSnap = (snapId, customer_id, reaction_type) =>
  api.post(`/api/snaps/${snapId}/react`, { customer_id, reaction_type });
