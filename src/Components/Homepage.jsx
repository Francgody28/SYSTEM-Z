import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import "./Homepage.css";
import img1 from "../assets/kikao2.jpg";
import img2 from "../assets/zafir-building.jpg";
import img3 from "../assets/kikao1.jpg";
import img4 from "../assets/meeting.jpg";
import img5 from "../assets/kikao.jpg";

const images = [img1, img2, img3, img4, img5];

export default function Homepage() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSignUp = () => {
    navigate("/login"); // Navigate to login page
  };

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <div className="logo">ZAFIRI-PORTAL</div>
        <button className="signup-btn" onClick={handleSignUp}>
          Login
        </button>
      </header>

      <main className="homepage-main">
        <div className="hero-section">
          <div className="carousel">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="Welcome"
                className={`carousel-image ${index === current ? "active" : ""}`}
              />
            ))}
          </div>
          <div className="hero-text">
            <h1>Welcome to ZAFIRI-PORTAL</h1>
            <p>
              Transform the way you manage your fisheries, labs, and research.
              Collaborate in real-time and boost your productivity seamlessly.
            </p>
            <button className="cta-btn" onClick={handleSignUp}>
              Login
            </button>
          </div>
        </div>

        <section className="features-section">
          <h2>Why working with us?</h2>
          <div className="features-cards">
            <div className="feature-card">
              <h3>Secure Data</h3>
              <p>Keep your research and data safe with robust security measures.</p>
            </div>
            <div className="feature-card">
              <h3>Responsive Design</h3>
              <p>Access your dashboard on any device, anytime, anywhere.</p>
            </div>
            <div className="feature-card">
              <h3>Powerful Tools</h3>
              <p>Efficient analytics and tracking tools designed for researchers.</p>
            </div>
          </div>
        </section>

        <section className="mission-vision">
          <div className="mission">
            <h2>Our Mission</h2>
            <p>
         ZAFIRI is dedicated to conducting state-of-the-Art researches
         on fisheries and marine resources, and promoting the cutting-edge
          innovations to unleash opportunities of Blue Economy for sustainable 
          economic development of Zanzibar.
            </p>
          </div>
          <div className="vision">
            <h2>Our Vision</h2>
            <p>
            To be a centre of excellence for fisheries and 
            marine resources research in the Western Indian Ocean.
            </p>
          </div>
        </section>
      </main>

      <footer className="homepage-footer">
        <p>© 2025 ZAFIRI-PORTAL. All rights reserved.</p>
      </footer>
    </div>
  );
}
