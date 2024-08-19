import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./forgotPassword.css";
import "../../index.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="forgot-password">
      <div className="forgot-password-card">
        <div className="content">
          <h1>Forgot Password</h1>
          <p className="forgot-password-instructions">
            Enter your email address and we'll send you a link to reset your
            password. Be sure to check your spam folder if you don't see it in
            your inbox.
          </p>
        </div>
        <form className="form-container" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>
        {message && <div className="message">{message}</div>}
        <Link to="/login" className="back-to-login">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
