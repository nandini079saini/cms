import api from "./axiosInstance";

export const getAllPosts = async () => {
  const response = await api.get("/api/posts");
  return response.data;
};

export const getPostById = async (id) => {
  const response = await api.get(`/api/posts/${id}`);
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post("/api/login", { email, password });
  return response.data;
};

export const customerLogin = async (email, password) => {
  const response = await api.post("/api/customers/login", { email, password });
  return response.data;
};

export const customerSignup = async (name, email, phone, password) => {
  const response = await api.post("/api/customers/signup", {
    name,
    email,
    phone,
    password,
  });
  return response.data;
};

export const updateCustomerProfile = async (id, data) => {
  const response = await api.put(`/api/customers/${id}`, data);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/api/categories");
  return response.data;
};

export const getRelatedAi = async (params) => {
  const response = await api.get("/api/related-ai", { params });
  return response.data;
};
