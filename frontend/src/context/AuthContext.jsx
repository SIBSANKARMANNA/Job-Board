import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true until first /me check is done

  // On mount: if token exists, verify it and hydrate user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    authAPI.getMe()
      .then((res) => {
        // backend: { success, data: { user } } OR { success, data: user }
        const u = res.data?.data?.user ?? res.data?.data ?? null;
        setUser(u);
      })
      .catch(() => {
        localStorage.removeItem("token"); // token invalid/expired
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Call this after a successful login/register response.
   * Stores the token and sets the user — ProtectedRoute
   * reads `user` synchronously on the next render.
   */
  const login = useCallback((token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) =>
    setUser((prev) => ({ ...prev, ...updated })), []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);