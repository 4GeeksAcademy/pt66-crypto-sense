import { Link, useNavigate } from "react-router-dom";
import "../login.css";
import PropTypes from "prop-types";
import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import Cookies from 'js-cookie'; // Ensure js-cookie is imported

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
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
        throw new Error(`Non-JSON response: ${data}`);
      }
      if (!response.ok) {
        throw new Error(data.message || "Login failed!");
      }

      // Assuming the response contains token and user info
      const { token, user } = data;

      // Set cookies for token and user
      Cookies.set('token', token, { expires: 1 }); // Expires in 1 day
      Cookies.set('user', JSON.stringify(user), { expires: 1 });

      // Update global state
      dispatch({ type: "update_user", user });
      dispatch({ type: "update_token", token });

      // Redirect to favorite coins page
      navigate("/home");
    } catch (error) {
      setError("Invalid Email or Password.");
    }
  };

  return (
    <div className="login">
      <div className="loginCard">
        <div className="left">
          <h1>Hi My People.</h1>
          <p>
            Welcome back to CryptoSense! Log in to continue tracking your
            favorite cryptocurrencies and stay updated.
          </p>
          <span>Don't you have an account?</span>
          <Link to="/register">
            <button className="register-button">Register</button>
          </Link>
        </div>
        <div className="right">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
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
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button">Login</button>
            <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
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
