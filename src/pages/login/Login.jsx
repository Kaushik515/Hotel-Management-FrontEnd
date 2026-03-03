import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: undefined,
    password: undefined,
  });
  const [showPassword, setShowPassword] = useState(false);

  const { loading, error, dispatch } = useContext(AuthContext);

  const navigate = useNavigate()

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await axios.post("/api/auth/login", credentials);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { ...res.data.details, token: res.data.token },
      });
      navigate("/")
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });
    }
  };


  return (
    <div className="login">
      <div className="lContainer">
        <h1 className="lTitle">Welcome Back</h1>
        <p className="lSubtitle">Login to continue your hotel journey</p>
        <input
          type="text"
          placeholder="Username"
          id="username"
          onChange={handleChange}
          className="lInput"
        />
        <div className="lPasswordWrap">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            id="password"
            onChange={handleChange}
            className="lInput"
          />
          <button
            type="button"
            className="lToggle"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button disabled={loading} onClick={handleClick} className="lButton">
          Login
        </button>
        {error && <span className="lError">{error.message}</span>}
      </div>
    </div>
  );
};

export default Login;
