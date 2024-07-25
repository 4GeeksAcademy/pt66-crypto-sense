import "../register.css";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();

  const handleSignUp = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName,
            email,
            password,
            firstName,
            lastName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      console.log(data.message);
      navigate("/login");
    } catch (error) {
      console.log("Error", error.message);
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Crypto Sense</h1>
          <p>
            Welcome to CryptoSense! Start tracking your favorite
            cryptocurrencies effortlessly. Need help? We're here for you. Let's
            get you started!
          </p>
          <span>Do you have an account?</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>
        <div className="right">
          <h1>Register</h1>
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e=> setEmail(e.target.value))}
              required
            />
            <input
              type="password"
              id="passwordInput"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setlastName(e.target.value)}
              required
            />
            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

Register.propTypes = {
  match: PropTypes.object,
};

export default Register;
