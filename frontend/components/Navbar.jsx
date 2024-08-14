import { Link,useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "../index.css"

export const Navbar = () => {
  const location = useLocation();
  const { store, dispatch } = useGlobalReducer();
  const { token } = store;

  const isLandingPage = ['/', '/login', '/register'].includes(location.pathname);

  const handleLogout = () => {
    dispatch({ type: 'update_token', token: null });
    dispatch({ type: 'update_user', user: null });
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
        <Link className="brand-nav m-0" to="/">
          <img className="logo-image" src="frontend/assets/img/logo.png" alt="logo" />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
          {!isLandingPage && token ? (
            <>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/favoritecoins">Portfolio</Link>
                </li>
              </ul>
              <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <div>
              <Link to="/register" className="btn btn-primary me-2">Try for Free</Link>
              <Link to="/login" className="btn btn-outline-light">Sign In</Link>
            </div>
          )}
        </div>
    </nav>
  );
};