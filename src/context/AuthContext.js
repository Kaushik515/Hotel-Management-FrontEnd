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
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");

      if (storedUser?.token && isTokenActive(storedUser.token)) {
        dispatch({ type: "LOGIN_SUCCESS", payload: storedUser });
      } else {
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem("user");
    } finally {
      setIsAuthInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (state.user?.token && isTokenActive(state.user.token)) {
      localStorage.setItem("user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("user");
    }
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
