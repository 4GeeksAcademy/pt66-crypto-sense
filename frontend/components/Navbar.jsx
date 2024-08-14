import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store } = useGlobalReducer();
  const { token } = store;


  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container">
        <Link className="navbar-brand" to="/">CryptoSense</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" aria-current="page" to="/">Crypto Coins</Link>
            </li>
            {token && ( <li className="nav-item">
              <Link className="nav-link" to="/favoritecoins">Portfolio</Link>
            </li>)}
          </ul>
        </div>
        {token ? (  
          <button className="logout">
            <Link to="/logout" style={{ textDecoration: "inherit", color: "inherit" }}>
              Logout
            </Link>
          </button>
        ) : <button className="logout">
        <Link to="/login" style={{ textDecoration: "inherit", color: "inherit" }}>
          Login
        </Link>
      </button>
      }
      </div>
    </nav>
  );
};
