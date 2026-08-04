import api from "./axiosInstance";

export const getAllQuickBites = async () => {
  const response = await api.get("/api/quickbites");
  return response.data;
};

export const getQuickBiteById = async (id) => {
  const response = await api.get(`/api/quickbites/${id}`);
  return response.data;
};

export const createQuickBite = async (data) => {
  const response = await api.post("/api/quickbites", data);
  return response.data;
};

export const updateQuickBite = async (id, data) => {
  const response = await api.put(`/api/quickbites/${id}`, data);
  return response.data;
};

export const deleteQuickBite = async (id) => {
  const response = await api.delete(`/api/quickbites/${id}`);
  return response.data;
};

export const reorderQuickBites = async (orderedIds) => {
  const response = await api.patch("/api/quickbites/reorder", { orderedIds });
  return response.data;
};
