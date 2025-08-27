import React, { useState } from "react";
import { User, Lock } from "lucide-react"; // ✅ import icons
import "./Login.css";
import logo from "../assets/zafiri.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("Login is disabled in static mode.");
  };

  return (
    <div className="login-page-container">
      {/* Left Side - Logo and Branding */}
      <div className="login-left-side">
        <div className="logo-section">
          <img src={logo} alt="ZAFIRI Logo" className="login-logo-image" />
          <h1 className="system-title">SERIKALI YA MAPINDUZI YA ZANZIBAR</h1>
        </div>

        <div className="branding-content">
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
            <h2 className="login-title">LOGIN</h2>
            <p className="login-subtitle">Access your government portal</p>
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
