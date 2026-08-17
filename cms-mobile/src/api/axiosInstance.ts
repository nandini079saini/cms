import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { API_BASE_URL } from "./config";
import { STORAGE_KEY_TOKEN } from "../context/AuthContext";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(STORAGE_KEY_TOKEN);
    }
    return await SecureStore.getItemAsync(STORAGE_KEY_TOKEN);
  } catch {
    return null;
  }
}

// Attaches the JWT (if the user is logged in) to every request. Public
// endpoints (GET /api/posts, /api/categories, etc.) ignore the header, so
// it's safe to send it unconditionally rather than tracking per-route.
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server ever says the token is invalid/expired, clear it out of
// storage so the app doesn't keep sending a dead token on every request.
// Note: this only clears storage — it doesn't force a re-render/redirect,
// since axios interceptors run outside the React tree. AuthContext will
// pick up "logged out" on next app launch either way; if you want an
// immediate redirect to /login the moment a 401 happens, that needs a
// small event emitter (or React Query's global error handler) wired to
// call the AuthContext logout() — worth adding later if stale sessions
// become a real annoyance in testing.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        if (Platform.OS === "web") {
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          localStorage.removeItem("cms_mobile_user");
        } else {
          await SecureStore.deleteItemAsync(STORAGE_KEY_TOKEN);
          await SecureStore.deleteItemAsync("cms_mobile_user");
        }
      } catch {
        // storage cleanup failing isn't worth surfacing to the user
      }
    }
    return Promise.reject(error);
  },
);

export default api;
