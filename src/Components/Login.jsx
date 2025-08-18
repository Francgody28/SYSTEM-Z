import React, { useState } from "react";
import "./Login.css";
import logo from "../assets/zafiri.png";
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
          "X-CSRFToken": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const contentType = res.headers.get("content-type") || "";
      let rawBody;
      let data;

      try {
        rawBody = await res.text();
        if (contentType.includes("application/json")) {
          try {
            data = JSON.parse(rawBody);
          } catch (parseErr) {
            console.error("JSON parse error:", parseErr, "Raw body:", rawBody);
            throw new Error("Invalid server response (malformed JSON).");
          }
        } else {
          data = { detail: rawBody };
        }
      } catch (readErr) {
        console.error("Response body read error:", readErr);
        throw new Error("Unable to read server response.");
      }

      if (!res.ok) {
        const msg =
          data?.error ||
          data?.detail ||
          data?.message ||
          `Server error (${res.status})`;
        throw new Error(msg);
      }

      // Handle role-based routing
      const userRole = data.user?.role || data.role || 'user';
      const userType = data.user?.user_type || data.user_type || userRole;
      
      // Determine dashboard route based on role
      let dashboardRoute = '/user-dashboard';
      if (userRole === 'admin' || userType === 'admin' || data.is_admin || data.user?.is_staff) {
        dashboardRoute = '/admin-dashboard';
      }

      onLoggedIn({
        ...data,
        showWelcomeMessage: true,
        dashboardRoute: dashboardRoute,
        userRole: userRole,
        userType: userType
      });
    } catch (err) {
      console.error("Login request failed:", err);
      const message =
        err.message === "Failed to fetch"
          ? "Network error. Please check your connection."
          : err.message || "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get CSRF token if needed
  const getCsrfToken = () => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrftoken") {
        return value;
      }
    }
    return "";
  };

  return (
    <>
      <div className="login-page-wrapper" />
      <div className="login-bg">
        <div
          className="background-image"
        />
        <div className="login-main-container">
          <div className="login-image-container">
            <img src={logo} alt="Login" className="login-image" />
            <div>
              <h1 className="login-logo">
                <strong>ZAFIRI-PORTAL</strong>
              </h1>
            </div>
          </div>
          <div className="login-container">
            <form onSubmit={handleSubmit}>
              <h2 className="login-title">LOGIN</h2>
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
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
    </>
  );
}