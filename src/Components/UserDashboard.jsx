import React from "react";
import "./Dashboard.css";

export default function UserDashboard({ authData, onLogout }) {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>User Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {authData?.user?.username || authData?.username || 'User'}</span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>My Profile</h3>
            <p>View and update your profile information</p>
            <button className="card-btn">View Profile</button>
          </div>
          
          <div className="dashboard-card">
            <h3>My Tasks</h3>
            <p>Manage your assigned tasks and projects</p>
            <button className="card-btn">View Tasks</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Documents</h3>
            <p>Access your documents and files</p>
            <button className="card-btn">My Documents</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Notifications</h3>
            <p>Check your latest notifications</p>
            <button className="card-btn">View Notifications</button>
          </div>
        </div>
      </main>
    </div>
  );
}
