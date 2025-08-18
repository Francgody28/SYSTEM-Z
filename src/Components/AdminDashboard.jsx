import React from "react";
import "./Dashboard.css";

export default function AdminDashboard({ authData, onLogout, onNavigateToRegister }) {
  const handleAddEmployee = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister();
    }
  };

  return (
    <div className="dashboard-container admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {authData?.user?.username || authData?.username || 'Admin'}</span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>User Management</h3>
            <p>Manage system users and permissions</p>
            <button className="card-btn">Manage Users</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Add Employee</h3>
            <p>Register new employees to the system</p>
            <button className="card-btn" onClick={handleAddEmployee}>Add Employee</button>
          </div>
          
          <div className="dashboard-card">
            <h3>System Settings</h3>
            <p>Configure system settings and preferences</p>
            <button className="card-btn">Settings</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Reports</h3>
            <p>View system reports and analytics</p>
            <button className="card-btn">View Reports</button>
          </div>
          
          <div className="dashboard-card">
            <h3>Security</h3>
            <p>Monitor security logs and access</p>
            <button className="card-btn">Security</button>
          </div>
        </div>
      </main>
    </div>
  );
}
