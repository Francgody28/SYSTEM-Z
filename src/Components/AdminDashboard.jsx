import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { API_BASE } from "../config";

// CSRF + API helpers (local)
const getCSRFToken = () => {
	const match = document.cookie.match(/(^|;\s*)csrftoken=([^;]+)/);
	return match ? decodeURIComponent(match[2]) : "";
};

const apiUpdateUser = async (userId, payload) => {
	const res = await fetch(`${API_BASE}/api/users/${userId}/update/`, {
		method: "PUT",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			"X-CSRFToken": getCSRFToken(),
		},
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`Update failed: ${res.status}`);
	return res.json();
};

const apiDeleteUser = async (userId) => {
	const res = await fetch(`${API_BASE}/api/users/${userId}/delete/`, {
		method: "DELETE",
		credentials: "include",
		headers: {
			"X-CSRFToken": getCSRFToken(),
		},
	});
	if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
	return true;
};

export default function AdminDashboard({ authData, onLogout, onNavigateToRegister, onNavigateToUserStats }) {
	const [users, setUsers] = useState([]);
	const [_usersError, setUsersError] = useState("");
	const [activeNav, setActiveNav] = useState("Home");

	useEffect(() => {
		let mounted = true;
		const fetchUsers = async () => {
			try {
				setUsersError("");
				const res = await fetch(`${API_BASE}/api/users/`, {
					method: "GET",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
				});
				if (!res.ok) throw new Error(`Server error: ${res.status}`);
				const data = await res.json();
				// support paginated and flat responses
				const list = Array.isArray(data) ? data : data.results || data.users || [];
				if (mounted) setUsers(list);
			} catch (err) {
				if (mounted) setUsersError(err.message || "Failed to load users");
			}
		};
		fetchUsers();
		return () => { mounted = false; };
	}, []);

	// open user-stats page (pass current users snapshot)
	const handleShowUserManagement = () => {
		setActiveNav("User Management");
		if (onNavigateToUserStats) {
			onNavigateToUserStats(users);
		}
	};

	const handleAddEmployee = () => {
		setActiveNav("Add Employee");
		// open register form for new employee
		if (onNavigateToRegister) onNavigateToRegister(null);
	};

	const handleNavClick = (navItem) => {
		setActiveNav(navItem);
		if (navItem === "Home") {
			// Stay on current page or refresh dashboard
		}
	};

	// Optional: local handlers to use the new API and keep state in sync
	const _handleUpdateUser = async (userId, updates) => {
		try {
			const updated = await apiUpdateUser(userId, updates);
			setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updated } : u)));
		} catch (e) {
			setUsersError(e.message || "Failed to update user");
		}
	};

	const _handleDeleteUser = async (userId) => {
		try {
			await apiDeleteUser(userId);
			setUsers(prev => prev.filter(u => u.id !== userId));
		} catch (e) {
			setUsersError(e.message || "Failed to delete user");
		}
	};

	return (
		<div className="dashboard-container admin-dashboard" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
			<aside className="sidebar" aria-label="Main navigation" style={{
				position: "fixed",
				left: 0,
				top: 0,
				height: "100vh",
				width: "260px",
				background: "#1e293b",
				color: "white",
				zIndex: 1000,
				transition: "all 0.3s ease",
				display: "flex",
				flexDirection: "column"
			}}>
				<div className="sidebar-brand" style={{
					padding: "1.5rem",
					fontSize: "1.25rem",
					fontWeight: "700",
					borderBottom: "1px solid #334155",
					color: "white"
				}}>
					ZAFIRI-PORTAL
				</div>
				<nav className="sidebar-nav" style={{ flex: 1, padding: "1rem 0" }}>
					<ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
						<li>
							<button 
								className="sidebar-link" 
								onClick={() => handleNavClick("Home")}
								style={{
									width: "100%",
									padding: "0.75rem 1.5rem",
									background: activeNav === "Home" ? "#334155" : "transparent",
									border: "none",
									color: activeNav === "Home" ? "white" : "#cbd5e1",
									textAlign: "left",
									fontSize: "0.95rem",
									cursor: "pointer",
									transition: "all 0.2s ease",
									fontWeight: activeNav === "Home" ? "600" : "400"
								}}
								onMouseEnter={(e) => {
									if (activeNav !== "Home") {
										e.target.style.background = "#475569";
										e.target.style.color = "white";
									}
								}}
								onMouseLeave={(e) => {
									if (activeNav !== "Home") {
										e.target.style.background = "transparent";
										e.target.style.color = "#cbd5e1";
									}
								}}
							>
								Home
							</button>
						</li>
						<li>
							<button 
								className="sidebar-link" 
								onClick={handleAddEmployee}
								style={{
									width: "100%",
									padding: "0.75rem 1.5rem",
									background: activeNav === "Add Employee" ? "#334155" : "transparent",
									border: "none",
									color: activeNav === "Add Employee" ? "white" : "#cbd5e1",
									textAlign: "left",
									fontSize: "0.95rem",
									cursor: "pointer",
									transition: "all 0.2s ease",
									fontWeight: activeNav === "Add Employee" ? "600" : "400"
								}}
								onMouseEnter={(e) => {
									if (activeNav !== "Add Employee") {
										e.target.style.background = "#475569";
										e.target.style.color = "white";
									}
								}}
								onMouseLeave={(e) => {
									if (activeNav !== "Add Employee") {
										e.target.style.background = "transparent";
										e.target.style.color = "#cbd5e1";
									}
								}}
							>
								Add Employee
							</button>
						</li>
						<li>
							<button 
								className="sidebar-link" 
								onClick={handleShowUserManagement}
								style={{
									width: "100%",
									padding: "0.75rem 1.5rem",
									background: activeNav === "User Management" ? "#334155" : "transparent",
									border: "none",
									color: activeNav === "User Management" ? "white" : "#cbd5e1",
									textAlign: "left",
									fontSize: "0.95rem",
									cursor: "pointer",
									transition: "all 0.2s ease",
									fontWeight: activeNav === "User Management" ? "600" : "400"
								}}
								onMouseEnter={(e) => {
									if (activeNav !== "User Management") {
										e.target.style.background = "#475569";
										e.target.style.color = "white";
									}
								}}
								onMouseLeave={(e) => {
									if (activeNav !== "User Management") {
										e.target.style.background = "transparent";
										e.target.style.color = "#cbd5e1";
									}
								}}
							>
								User Management
							</button>
						</li>
						<li>
							<button 
								className="sidebar-link"
								onClick={() => handleNavClick("Reports")}
								style={{
									width: "100%",
									padding: "0.75rem 1.5rem",
									background: activeNav === "Reports" ? "#334155" : "transparent",
									border: "none",
									color: activeNav === "Reports" ? "white" : "#cbd5e1",
									textAlign: "left",
									fontSize: "0.95rem",
									cursor: "pointer",
									transition: "all 0.2s ease",
									fontWeight: activeNav === "Reports" ? "600" : "400"
								}}
								onMouseEnter={(e) => {
									if (activeNav !== "Reports") {
										e.target.style.background = "#475569";
										e.target.style.color = "white";
									}
								}}
								onMouseLeave={(e) => {
									if (activeNav !== "Reports") {
										e.target.style.background = "transparent";
										e.target.style.color = "#cbd5e1";
									}
								}}
							>
								Reports
							</button>
						</li>
						<li>
							<button 
								className="sidebar-link"
								onClick={() => handleNavClick("Security")}
								style={{
									width: "100%",
									padding: "0.75rem 1.5rem",
									background: activeNav === "Security" ? "#334155" : "transparent",
									border: "none",
									color: activeNav === "Security" ? "white" : "#cbd5e1",
									textAlign: "left",
									fontSize: "0.95rem",
									cursor: "pointer",
									transition: "all 0.2s ease",
									fontWeight: activeNav === "Security" ? "600" : "400"
								}}
								onMouseEnter={(e) => {
									if (activeNav !== "Security") {
										e.target.style.background = "#475569";
										e.target.style.color = "white";
									}
								}}
								onMouseLeave={(e) => {
									if (activeNav !== "Security") {
										e.target.style.background = "transparent";
										e.target.style.color = "#cbd5e1";
									}
								}}
							>
								Security
							</button>
						</li>
					</ul>
				</nav>
				<div className="sidebar-footer" style={{ 
					padding: "1rem 1.5rem", 
					borderTop: "1px solid #334155" 
				}}>
					<button 
						onClick={onLogout} 
						className="logout-btn sidebar-logout"
						style={{
							width: "100%",
							padding: "0.75rem 1rem",
							background: "#dc2626",
							color: "white",
							border: "none",
							borderRadius: "6px",
							fontSize: "0.95rem",
							fontWeight: "500",
							cursor: "pointer",
							transition: "all 0.2s ease"
						}}
						onMouseEnter={(e) => {
							e.target.style.background = "#b91c1c";
						}}
						onMouseLeave={(e) => {
							e.target.style.background = "#dc2626";
						}}
					>
						Logout
					</button>
				</div>
			</aside>

			<div className="dashboard-content" style={{ marginLeft: "260px", minHeight: "100vh" }}>
				<header className="dashboard-header" style={{
					padding: "1.5rem 2rem",
					borderBottom: "1px solid #e2e8f0",
					background: "white",
					position: "sticky",
					top: 0,
					zIndex: 100
				}}>
					<h1 style={{
						fontSize: "2rem",
						fontWeight: "700",
						color: "#1e293b",
						margin: 0
					}}>
						Admin Dashboard
					</h1>
					<div className="user-info" style={{
						fontSize: "1rem",
						color: "#6b7280",
						fontWeight: "500"
					}}>
						<span>Welcome, {authData?.user?.username || authData?.username || 'Admin'}</span>
					</div>
				</header>

				<main className="dashboard-main" style={{ padding: "2rem" }}>
					<div className="dashboard-grid" style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
						gap: "1.5rem",
						maxWidth: "1200px",
						margin: "0"
					}}>
						<div className="dashboard-card" style={{
							background: "white",
							border: "1px solid #e5e7eb",
							borderRadius: "12px",
							padding: "2rem",
							boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
							transition: "all 0.2s ease",
							cursor: "pointer"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-2px)";
							e.currentTarget.style.boxShadow = "0 8px 25px -1px rgba(0, 0, 0, 0.15)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0)";
							e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
						}}>
							<h3 style={{
								fontSize: "1.25rem",
								fontWeight: "600",
								color: "#1f2937",
								marginBottom: "0.75rem"
							}}>
								User Management
							</h3>
							<p style={{
								fontSize: "0.95rem",
								color: "#6b7280",
								marginBottom: "1.5rem",
								lineHeight: "1.5"
							}}>
								View aggregated user counts and departments
							</p>
							<button 
								className="card-btn" 
								onClick={handleShowUserManagement}
								style={{
									width: "100%",
									padding: "0.75rem 1.5rem",
									background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
									color: "white",
									border: "none",
									borderRadius: "8px",
									fontSize: "0.95rem",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s ease"
								}}
								onMouseEnter={(e) => {
									e.target.style.transform = "scale(1.02)";
								}}
								onMouseLeave={(e) => {
									e.target.style.transform = "scale(1)";
								}}
							>
								View User Stats
							</button>
						</div>

						<div className="dashboard-card" style={{
							background: "white",
							border: "1px solid #e5e7eb",
							borderRadius: "12px",
							padding: "2rem",
							boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
							transition: "all 0.2s ease",
							cursor: "pointer"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-2px)";
							e.currentTarget.style.boxShadow = "0 8px 25px -1px rgba(0, 0, 0, 0.15)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0)";
							e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
						}}>
							<h3 style={{
								fontSize: "1.25rem",
								fontWeight: "600",
								color: "#1f2937",
								marginBottom: "0.75rem"
							}}>
								Add Employee
							</h3>
							<p style={{
								fontSize: "0.95rem",
								color: "#6b7280",
								marginBottom: "1.5rem",
								lineHeight: "1.5"
							}}>
								Register new employees to the system
							</p>
							<button 
								className="card-btn" 
								onClick={handleAddEmployee}
								style={{
									width: "100%",
									padding: "0.75rem 1.5rem",
									background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
									color: "white",
									border: "none",
									borderRadius: "8px",
									fontSize: "0.95rem",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s ease"
								}}
								onMouseEnter={(e) => {
									e.target.style.transform = "scale(1.02)";
								}}
								onMouseLeave={(e) => {
									e.target.style.transform = "scale(1)";
								}}
							>
								Add Employee
							</button>
						</div>

						<div className="dashboard-card" style={{
							background: "white",
							border: "1px solid #e5e7eb",
							borderRadius: "12px",
							padding: "2rem",
							boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
							transition: "all 0.2s ease",
							cursor: "pointer"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-2px)";
							e.currentTarget.style.boxShadow = "0 8px 25px -1px rgba(0, 0, 0, 0.15)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0)";
							e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
						}}>
							<h3 style={{
								fontSize: "1.25rem",
								fontWeight: "600",
								color: "#1f2937",
								marginBottom: "0.75rem"
							}}>
							  System Settings
							</h3>
							<p style={{
								fontSize: "0.95rem",
								color: "#6b7280",
								marginBottom: "1.5rem",
								lineHeight: "1.5"
							}}>
								Configure system settings and preferences
							</p>
							<button 
								className="card-btn"
								style={{
									width: "100%",
									padding: "0.75rem 1.5rem",
									background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
									color: "white",
									border: "none",
									borderRadius: "8px",
									fontSize: "0.95rem",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s ease"
								}}
								onMouseEnter={(e) => {
									e.target.style.transform = "scale(1.02)";
								}}
								onMouseLeave={(e) => {
									e.target.style.transform = "scale(1)";
								}}
							>
								Settings
							</button>
						</div>

						<div className="dashboard-card" style={{
							background: "white",
							border: "1px solid #e5e7eb",
							borderRadius: "12px",
							padding: "2rem",
							boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
							transition: "all 0.2s ease",
							cursor: "pointer"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-2px)";
							e.currentTarget.style.boxShadow = "0 8px 25px -1px rgba(0, 0, 0, 0.15)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0)";
							e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
						}}>
							<h3 style={{
								fontSize: "1.25rem",
								fontWeight: "600",
								color: "#1f2937",
								marginBottom: "0.75rem"
							}}>
								Reports
							</h3>
							<p style={{
								fontSize: "0.95rem",
								color: "#6b7280",
								marginBottom: "1.5rem",
								lineHeight: "1.5"
							}}>
								View system reports and analytics
							</p>
							<button 
								className="card-btn"
								style={{
									width: "100%",
									padding: "0.75rem 1.5rem",
									background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
									color: "white",
									border: "none",
									borderRadius: "8px",
									fontSize: "0.95rem",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s ease"
								}}
								onMouseEnter={(e) => {
									e.target.style.transform = "scale(1.02)";
								}}
								onMouseLeave={(e) => {
									e.target.style.transform = "scale(1)";
								}}
							>
								View Reports
							</button>
						</div>

						<div className="dashboard-card" style={{
							background: "white",
							border: "1px solid #e5e7eb",
							borderRadius: "12px",
							padding: "2rem",
							boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
							transition: "all 0.2s ease",
							cursor: "pointer"
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-2px)";
							e.currentTarget.style.boxShadow = "0 8px 25px -1px rgba(0, 0, 0, 0.15)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0)";
							e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
						}}>
							<h3 style={{
								fontSize: "1.25rem",
								fontWeight: "600",
								color: "#1f2937",
								marginBottom: "0.75rem"
							}}>
								Security
							</h3>
							<p style={{
								fontSize: "0.95rem",
								color: "#6b7280",
								marginBottom: "1.5rem",
								lineHeight: "1.5"
							}}>
								Monitor security logs and access
							</p>
							<button 
								className="card-btn"
								style={{
									width: "100%",
									padding: "0.75rem 1.5rem",
									background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
									color: "white",
									border: "none",
									borderRadius: "8px",
									fontSize: "0.95rem",
									fontWeight: "500",
									cursor: "pointer",
									transition: "all 0.2s ease"
								}}
								onMouseEnter={(e) => {
									e.target.style.transform = "scale(1.02)";
								}}
								onMouseLeave={(e) => {
									e.target.style.transform = "scale(1)";
								}}
							>
								Security
							</button>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
