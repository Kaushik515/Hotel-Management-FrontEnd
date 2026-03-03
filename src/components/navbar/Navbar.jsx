import "./navbar.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
const Navbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    }
  };

  return (
    <div className="navbar">
      <div className="navContainer">
        <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
          <span className="logo">GoBookings</span>
        </Link>
        {user ? (
          <div className="navItems">
            <Link to="/my-bookings">
              <button className="navButton">My Bookings</button>
            </Link>
            <button className="navButton navLogoutButton" onClick={handleLogout}>Logout</button>
            <span className="navUsername">{user.username}</span>
          </div>
        ) : (
          <div className="navItems">
            <Link to={"/register"}><button className="navButton" >Register</button></Link>
            <Link to={"/login"}><button className="navButton" >Login</button></Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
