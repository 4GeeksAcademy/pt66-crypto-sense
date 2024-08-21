import { Link, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../styles/Navbar.css";
import Cookies from "js-cookie";
import logoImage from "../assets/img/logo.png";
import { useTheme } from "../components/ThemeContext";
import { User, Sun, Moon, LogOut } from "lucide-react";

export const Navbar = () => {
  const location = useLocation();
  const { store, dispatch } = useGlobalReducer();
  const { token } = store;
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme, globalTheme } = useTheme();

  const isLandingPage = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");

    dispatch({ type: "update_token", token: null });
    dispatch({ type: "update_user", user: null });
    dispatch({ type: "load_coins", coins: [] });
    navigate("/login");
  };

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${
        isDarkMode ? "dark" : "light"
      }`}
    >
      <Link className="brand-nav m-0" to="/">
        <img className="logo-image" src={logoImage} alt="logo" />
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div
        className="collapse navbar-collapse justify-content-end"
        id="navbarSupportedContent"
      >
        {token && !isLandingPage ? (
          <>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 mx-5">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/home">
                  Crypto Search
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/favoritecoins">
                  Portfolio
                </Link>
              </li>
            </ul>
            <div className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <User size={24} />
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="navbarDropdown"
              >
                <li>
                  <a className="dropdown-item" href="#" onClick={toggleTheme}>
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    <span className="ms-2">
                      {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </span>
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item" href="#" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span className="ms-2">Logout</span>
                  </a>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div>
            <Link to="/register" className="btn btn-primary me-2">
              Try for Free
            </Link>
            <Link to="/login" className="btn btn-outline-light">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
