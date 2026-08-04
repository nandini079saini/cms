// src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync("cms_user");
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {
        console.warn("Failed to load stored user", e);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    await SecureStore.setItemAsync("cms_user", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync("cms_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}
