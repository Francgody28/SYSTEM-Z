import React, { useState } from "react";
import "./Login.css";
import logo from "../assets/zafiri.png";
import backgroundImage from "../assets/fish2.jpeg";
import { API_BASE } from "../config";

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/api/login/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken() 
      },
      body: JSON.stringify({ username, password }),
    });

    const text = await res.text();
    const data = JSON.parse(text);

    if (!res.ok) {
      throw new Error(data.error || data.detail || "Login failed");
    }

    onLoggedIn(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // Helper function to get CSRF token if needed
  const getCsrfToken = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return value;
      }
    }
    return '';
  };

  return (
    <div className="login-bg">
      <div className="background-image" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="login-main-container">
        <div className="login-image-container">
          <img src={logo} alt="Login" className="login-image" />
          <div><h1 className="login-logo"><strong>ZAFIRI-PORTAL</strong></h1></div>
        </div>
        <div className="login-container">
          <form onSubmit={handleSubmit}>
            <h2 className="login-title">Login</h2>
            {error && <div className="error-message">{error}</div>}
            <label htmlFor="username" className="login-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              required
              disabled={loading}
            />
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
              disabled={loading}
            />
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}