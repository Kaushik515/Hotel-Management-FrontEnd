import { createContext, useEffect, useReducer } from "react";

const AuthContext = createContext();

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
      
    default:
      return state;
  }
};

const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    try {
     // localStorage.setItem("user", JSON.stringify(userData));

      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        dispatch({ type: "LOGIN_SUCCESS", payload: storedUser });
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };
