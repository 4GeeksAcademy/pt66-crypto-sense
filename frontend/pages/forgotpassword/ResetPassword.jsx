import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./resetPassword.css";
import "../../index.css";

import Cookies from "js-cookie";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      console.log("Sending request with payload:", { token, password });
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed data:", data);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error(`Invalid response from server: ${responseText}`);
      }

      if (response.ok) {
        setMessage(data.message || "Password reset successful");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setMessage(error.message);
    }
  };

  const handleLogout = () => {
    // Simple logout: just navigate to login page
    // You may want to clear any stored tokens or state here
    navigate("/login");
  };

  return (
    <div className="forgot-password">
      <div className="reset-password-card">
        <h1>Reset Password</h1>
        <p className="reset-password-instructions">
          Enter your new password below. Make sure it's at least 8 characters long and includes a mix of letters, numbers, and symbols.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
        {message && <div className="message">{message}</div>}
        <Link to="/login" className="back-to-login">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ResetPassword;
