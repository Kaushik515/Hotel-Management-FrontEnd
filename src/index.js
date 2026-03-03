import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import axios from "axios";
import { AuthContextProvider } from "./context/AuthContext";
import { SearchContextProvider } from "./context/SearchContext";

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || "";
axios.defaults.withCredentials = true;

const parseJwtPayload = (token = "") => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

const isTokenActive = (token = "") => {
  if (!token || typeof token !== "string") return false;

  const payload = parseJwtPayload(token);
  const exp = Number(payload?.exp);

  if (!exp) return false;

  return exp * 1000 > Date.now();
};

const clearStoredSession = () => {
  try {
    localStorage.removeItem("user");
  } catch (error) {
    // noop
  }
};

axios.interceptors.request.use(
  (config) => {
    let token;

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      token = storedUser?.token;

      if (token && !isTokenActive(token)) {
        clearStoredSession();
        token = undefined;
      }
    } catch (error) {
      token = undefined;
    }

    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const isAuthEndpoint = requestUrl.includes("/api/auth/");

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      clearStoredSession();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login?reason=session-expired");
      }
    }

    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <SearchContextProvider>
        <App />
      </SearchContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
