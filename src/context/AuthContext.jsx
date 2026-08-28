/* eslint-disable react/prop-types, react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCurrentUser, tryLogin, tryLogout } from "@/API";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.user);
      return response.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("teca:unauthorized", handleUnauthorized);

    return () => window.removeEventListener("teca:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = useCallback(async (credentials) => {
    const response = await tryLogin(credentials);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await tryLogout();
    } catch {
      // Local authentication state must still be cleared if the session already
      // expired or the API is temporarily unavailable.
    } finally {
      setUser(null);
    }
  }, []);

  const updateCurrentUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = useMemo(
    () => ({ loading, login, logout, refreshAuth, updateCurrentUser, user }),
    [loading, login, logout, refreshAuth, updateCurrentUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export { AuthProvider, useAuth };
