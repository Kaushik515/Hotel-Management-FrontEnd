import "./navbar.css";
import { Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      dispatch({ type: "LOGOUT" });
      setIsMenuOpen(false);
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
            <div className="navDropdown" ref={menuRef}>
              <button
                className="navUserButton"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                type="button"
              >
                {user.username}
                <span className="navCaret">▾</span>
              </button>

              {isMenuOpen && (
                <div className="navDropdownMenu">
                  <Link
                    to="/account"
                    className="navDropdownItem"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="navDropdownItem"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <button
                    className="navDropdownItem navDropdownLogout"
                    onClick={handleLogout}
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
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
