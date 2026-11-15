import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const refreshUrl = `${API_URL.replace(/\/+$/, "")}/refresh`;
const noRefreshPaths = ["/login", "/logout", "/refresh", "/forgot-password", "/reset-password"];
let refreshRequest = null;

// Una sola renovación a la vez, también entre pestañas: el servidor rota el token
// de "recordarme", y dos renovaciones simultáneas con el mismo token cerrarían la
// sesión en ambas.
const runRefresh = () => {
  const request = () => axios.post(refreshUrl, {}, { withCredentials: true });
  return navigator.locks?.request
    ? navigator.locks.request("teca-session-refresh", request)
    : request();
};

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
          refreshRequest = runRefresh()
            .finally(() => {
              refreshRequest = null;
            });
        }

        await refreshRequest;
        return api(originalRequest);
      } catch (refreshError) {
        // Solo se cierra la sesión si el servidor la rechaza; un corte de red o un
        // error 500 no deben echar al usuario.
        if ([401, 403].includes(refreshError.response?.status)) {
          window.dispatchEvent(new Event("teca:unauthorized"));
        }
      }
    } else if (error.response?.status === 401) {
      window.dispatchEvent(new Event("teca:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default api;
