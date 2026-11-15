/* eslint-disable react/prop-types, react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, tryLogin, tryLogout } from "@/API";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const queryClient = useQueryClient();

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
    // Sesión caducada o cuenta desactivada: fuera los datos en memoria para que el
    // siguiente usuario del dispositivo no vea nada del anterior.
    const handleUnauthorized = () => {
      setUser((current) => {
        if (current) setSessionExpired(true);
        return null;
      });
      queryClient.clear();
    };
    window.addEventListener("teca:unauthorized", handleUnauthorized);

    return () => window.removeEventListener("teca:unauthorized", handleUnauthorized);
  }, [queryClient]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = useCallback(async (credentials) => {
    const response = await tryLogin(credentials);
    queryClient.clear();
    setSessionExpired(false);
    setUser(response.user);
    return response.user;
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      await tryLogout();
    } catch {
      // Local authentication state must still be cleared if the session already
      // expired or the API is temporarily unavailable.
    } finally {
      queryClient.clear();
      setSessionExpired(false);
      setUser(null);
    }
  }, [queryClient]);

  const updateCurrentUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = useMemo(
    () => ({ loading, login, logout, refreshAuth, sessionExpired, updateCurrentUser, user }),
    [loading, login, logout, refreshAuth, sessionExpired, updateCurrentUser, user]
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
