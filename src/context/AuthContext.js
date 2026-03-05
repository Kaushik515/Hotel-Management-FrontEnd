import { createContext, useEffect, useReducer, useState } from "react";

const AuthContext = createContext();

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

  if (!exp) {
    return false;
  }

  return exp * 1000 > Date.now();
};

const getTokenExpiryMs = (token = "") => {
  const payload = parseJwtPayload(token);
  const exp = Number(payload?.exp);

  if (!exp) return null;

  return exp * 1000;
};

const INITIAL_STATE = {
  user: null,
  loading: false,
  error: null,
};

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        loading: false,
        error: action.payload,
      };
      case "REGISTER_START":
      return {
        user: null,
        loading: true,
        error: null,
      };
    case "REGISTER_SUCCESS":
      return {
        user: action.payload,
        loading: false,
        error: null,
      };
    case "REGISTER_FAILURE":
      return {
        user: null,
        loading: false,
        error: action.payload,
      };
      
    case "LOGOUT":
      return {
        user: null,
        loading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        user: {
          ...(state.user || {}),
          ...(action.payload || {}),
          token: action.payload?.token || state.user?.token,
        },
        loading: false,
        error: null,
      };
      
    default:
      return state;
  }
};

const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");

      if (storedUser?.token && isTokenActive(storedUser.token)) {
        dispatch({ type: "LOGIN_SUCCESS", payload: storedUser });
      } else {
        sessionStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Error parsing user from sessionStorage:", error);
      sessionStorage.removeItem("user");
    } finally {
      localStorage.removeItem("user");
      setIsAuthInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (state.user?.token && isTokenActive(state.user.token)) {
      sessionStorage.setItem("user", JSON.stringify(state.user));
      localStorage.removeItem("user");
    } else {
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
    }
  }, [state.user]);

  useEffect(() => {
    if (!state.user?.token) return;

    const expiryMs = getTokenExpiryMs(state.user.token);
    if (!expiryMs) return;

    const remainingMs = expiryMs - Date.now();

    if (remainingMs <= 0) {
      dispatch({ type: "LOGOUT" });
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.assign("/login?reason=session-expired");
      }
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: "LOGOUT" });
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.assign("/login?reason=session-expired");
      }
    }, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        isAuthInitialized,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };
