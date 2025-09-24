import React, { useState, useEffect } from "react";
import { User, Lock } from "lucide-react";
import "./Login.css";
import logo from "../assets/zafiri.png";
import kikao from "../assets/kikao3.jpg";
import lab from "../assets/lab.jpg";
import event from "../assets/event.jpg";
import building from "../assets/zafir-building.jpg";

const carouselImages = [kikao, lab, event, building];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // System A backend (port 8000)
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens in System A
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("refreshToken", data.refresh);
        localStorage.setItem("username", data.username);

        // Direct redirect to the URL (which includes auto-login for PSMS users)
        console.log('Redirecting to:', data.redirect);
        console.log('User position:', data.position);
        console.log('Redirect to PSMS:', data.redirect_to_psms); // Updated field name
        
        window.location.href = data.redirect;
        
      } else {
        setError(data.detail || "Login failed");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Left Side - Logo and Branding */}
      <div
        className="login-left-side"
        style={{
          backgroundImage: `url(${carouselImages[bgIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease",
        }}
      >
        <div className="hero-text">
          <h3 className="welcome-text">ZAFIRI-PORTAL</h3>
          <p className="system-description">
            Secure Government Communication Platform
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right-side">
        <div className="login-form-container">
          <div className="login-header">
            <img src={logo} alt="ZAFIRI Logo" className="login-logo-image" />
            <h2 className="login-title">LOGIN</h2>
            <p className="login-subtitle">Access institute internal portal</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="input-group">
              <label htmlFor="username" className="input-label">
                Username
              </label>
              <div className="input-wrapper">
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
                <User className="input-icon" color="black" size={18} />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="input-wrapper">
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
                <Lock className="input-icon" color="black" size={18} />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Signing In..." : "LOGIN"}
            </button>
          </form>

          <div className="system-info">
            <p className="version">© 2025 | ZAFIIRI</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// // Example for authenticated fetch:
// const token = localStorage.getItem("authToken");
// fetch("/api/protected/", {
//   headers: {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   },
// });
