import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("cms_user")) || null,
  );
  const [token, setToken] = useState(
    () => localStorage.getItem("cms_token") || null,
  );

  // login(user, token) — both come back from POST /api/login now.
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("cms_user", JSON.stringify(userData));
    localStorage.setItem("cms_token", authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("cms_user");
    localStorage.removeItem("cms_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
