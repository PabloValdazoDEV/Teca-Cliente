import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const refreshUrl = new URL("/refresh", API_URL).toString();
const noRefreshPaths = ["/login", "/logout", "/refresh", "/forgot-password", "/reset-password"];
let refreshRequest = null;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestPath = originalRequest?.url || "";
    const canRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !noRefreshPaths.some((path) => requestPath.endsWith(path));

    if (canRefresh) {
      originalRequest._retry = true;

      try {
        if (!refreshRequest) {
          refreshRequest = axios
            .post(refreshUrl, {}, { withCredentials: true })
            .finally(() => {
              refreshRequest = null;
            });
        }

        await refreshRequest;
        return api(originalRequest);
      } catch {
        window.dispatchEvent(new Event("teca:unauthorized"));
      }
    } else if (error.response?.status === 401) {
      window.dispatchEvent(new Event("teca:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default api;
