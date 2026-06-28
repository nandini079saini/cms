import api from "./axiosInstance";

export const getAllPosts = () => api.get("/api/posts");
export const getPostById = (id) => api.get(`/api/posts/${id}`);
export const loginUser = (email, password) =>
  api.post("/api/login", { email, password });
export const customerLogin = (email, password) =>
  api.post("/api/customers/login", { email, password });
export const customerSignup = (name, email, phone, password) =>
  api.post("/api/customers/signup", { name, email, phone, password });
