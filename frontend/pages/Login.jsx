import { Link, useNavigate } from "react-router-dom";
import "../login.css";
import PropTypes from "prop-types";
import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        data = await response.text();
        throw new Error(`Non-JSON response: ${data}`);
      }
      if (!response.ok) {
        throw new Error(data.message || "Login failed!");
      }
      dispatch({ type: "update_user", user: data.user });
      dispatch({ type: "update_token", token: data.token });
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid Email or Password.");
    }
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>Hi My People.</h1>
          <p>
            Welcome back to CryptoSense! Log in to continue tracking your
            favorite cryptocurrencies and stay updated.{" "}
          </p>
          <span>Don't you have an account?</span>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
        <div className="right">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  match: PropTypes.object 
};

export default Login;
