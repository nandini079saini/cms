import api from "./axiosInstance";

export const getAllQuickBites = () => api.get("/api/quickbites");
export const getQuickBiteById = (id) => api.get(`/api/quickbites/${id}`);
export const createQuickBite = (data) => api.post("/api/quickbites", data);
export const updateQuickBite = (id, data) =>
  api.put(`/api/quickbites/${id}`, data);
export const deleteQuickBite = (id) => api.delete(`/api/quickbites/${id}`);
export const reorderQuickBites = (orderedIds) =>
  api.patch("/api/quickbites/reorder", { orderedIds });
