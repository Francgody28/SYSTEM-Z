import React, { useState } from "react";
import { updateUser, setupCSRF, deleteUser } from '../utils/api';

export default function UserStats({ users: initialUsers = [], onBack }) {
  const [users, setUsers] = useState(Array.isArray(initialUsers) ? initialUsers : []);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // new: inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // add changePassword state
  const [changePassword, setChangePassword] = useState(false);

  const deptCounts = users.reduce((acc, u) => {
    const dept = (u.department && u.department.trim()) || "Unknown";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const startEdit = (u) => {
    const uid = u.id || u.pk || u.username;
    setEditingId(uid);
    setSaveError("");
    setChangePassword(false); // reset toggle on start
    setEditForm({
      username: u.username || "",
      first_name: u.first_name || u.firstName || "",
      last_name: u.last_name || u.lastName || "",
      email: u.email || "",
      department: u.department || "",
      password: "", // do not prefill password
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setChangePassword(false); // reset toggle on cancel
    setEditForm({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      department: "",
      password: "",
    });
    setSaveError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setSaveError("");
    try {
      // Ensure CSRF token is set up before making the request
      await setupCSRF();
      
      const payload = {
        username: editForm.username,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        department: editForm.department,
        ...(changePassword && editForm.password ? { password: editForm.password } : {}),
      };

      console.log('Sending payload:', payload); // Debug log
      console.log('Editing user ID:', editingId); // Debug log

      // Use the updateUser function from api.js
      const updatedUser = await updateUser(editingId, payload);
      
      // Update the users state with the returned data
      setUsers((prev) =>
        prev.map((u) => {
          const uid = u.id || u.pk || u.username;
          if (uid === editingId) {
            return { ...u, ...updatedUser, ...payload, password: undefined };
          }
          return u;
        })
      );
      
      cancelEdit();
    } catch (err) {
      console.error("Save failed:", err);
      setSaveError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!user) return;
    const id = user.id || user.pk || user.username;
    if (!window.confirm(`Delete user "${user.full_name || user.username}"?`)) return;
    setLoadingDelete(true);
    try {
      // Ensure CSRF token is set up before making the request
      await setupCSRF();
      
      // Use the deleteUser function from api.js
      await deleteUser(id);
      
      setUsers((prev) => prev.filter((u) => (u.id || u.pk || u.username) !== id));
      // cancel edit if deleted user was being edited
      if (editingId === id) cancelEdit();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed: " + (err.message || err));
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="dashboard-container user-stats-page" style={{ 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      minHeight: "100vh",
      width: "100vw",
      margin: 0,
      padding: 0,
      position: "fixed",
      top: 0,
      left: 0
    }}>
      <aside className="sidebar" aria-label="Main navigation" style={{ 
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: "260px",
        background: "linear-gradient(180deg, #1e293b 0%, #334155 100%)",
        color: "white",
        zIndex: 1000,
        transition: "all 0.3s ease",
        boxShadow: "4px 0 20px rgba(0,0,0,0.1)"
      }}>
        <div className="sidebar-brand" style={{
          padding: "2rem 1.5rem",
          fontSize: "1.5rem",
          fontWeight: "800",
          borderBottom: "1px solid #475569",
          color: "white",
          textAlign: "center",
          letterSpacing: "1px"
        }}>
          ZAFIRI-PORTAL
        </div>
        <nav style={{ padding: "2rem 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <li>
              <button 
                className="nav-link" 
                onClick={onBack}
                style={{
                  width: "100%",
                  padding: "1rem 2rem",
                  background: "transparent",
                  border: "none",
                  color: "#cbd5e1",
                  textAlign: "left",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  borderLeft: "4px solid transparent"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(59, 130, 246, 0.1)";
                  e.target.style.color = "white";
                  e.target.style.borderLeftColor = "#3b82f6";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#cbd5e1";
                  e.target.style.borderLeftColor = "transparent";
                }}
              >
               -Dashboard
              </button>
            </li>
            <li>
              <div style={{
                padding: "1rem 2rem",
                background: "rgba(59, 130, 246, 0.2)",
                color: "white",
                fontSize: "1rem",
                fontWeight: "600",
                borderLeft: "4px solid #3b82f6"
              }}>
              -User Management
              </div>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="dashboard-content" style={{ 
        position: "fixed",
        left: "260px",
        top: 0,
        width: "calc(100vw - 260px)",
        height: "100vh",
        overflowY: "auto",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column"
      }}>
        <header className="dashboard-header" style={{ 
          padding: "0.75rem 1.5rem",
          borderBottom: "1px solid #e2e8f0",
          background: "white",
          position: "static",
          width: "100%",
          boxShadow: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
            <h1 style={{ 
              fontSize: "1.8rem",
              fontWeight: "700", 
              color: "#1e293b",
              margin: 0
            }}>
              User Statistics
            </h1>
            <div style={{ marginLeft: "auto" }}>
              <button 
                className="card-btn" 
                onClick={onBack}
                style={{
                  padding: "0.25rem 0.5rem",
                  background: "#5c8ef4ff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  height: "28px",
                  lineHeight: "28px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseEnter={(e) => { e.target.style.background = "#4d7abaff"; }}
                onMouseLeave={(e) => { e.target.style.background = "#1e63eeff"; }}
              >
                ← Back
              </button>
            </div>
          </div>
        </header>

        <main className="dashboard-main" style={{ 
          padding: "1.5rem 2rem",
          width: "100%",
          flex: "1 1 auto",
          boxSizing: "border-box"
        }}>
          <div style={{ width: "100%", margin: 0, padding: 0 }}>
            <section style={{ marginBottom: "3rem" }}>
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "2rem",
                boxShadow: "0 6px 30px rgba(15,23,42,0.06)",
                border: "1px solid #e6eef8"
              }}>
                <h3 style={{ 
                  fontSize: "1.9rem",
                  fontWeight: "800", 
                  color: "#0f172a",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}>
                Overview - Total users: {users.length}
                </h3>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {Object.entries(deptCounts).map(([dept, count]) => (
                    <div key={dept} style={{ 
                      padding: "1.25rem 1.75rem",
                      background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)", 
                      borderRadius: "12px",
                      color: "white",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      boxShadow: "0 12px 30px rgba(30,64,175,0.25)",
                      transition: "all 0.25s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-3px)";
                      e.target.style.boxShadow = "0 12px 30px rgba(30,64,175,0.22)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 6px 20px rgba(30,64,175,0.18)";
                    }}>
                      <strong>{dept}</strong>: {count}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ 
                fontSize: "1.8rem", 
                fontWeight: "800", 
                color: "#0f172a", 
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}>
                 User Management
              </h3>
              <ul className="user-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {users.map((u) => {
                  const uid = u.id || u.pk || u.username;
                  return (
                    <li key={uid} className="user-row" style={{
                      background: "#ffffff",
                      border: "1px solid #e6eef8",
                      borderRadius: "18px",
                      padding: "3rem",
                      marginBottom: "1.5rem",
                      boxShadow: "0 18px 50px rgba(2,6,23,0.12)",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-4px)";
                      e.target.style.boxShadow = "0 18px 50px rgba(2,6,23,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 12px 40px rgba(2,6,23,0.06)";
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
                        <div style={{ flex: 1 }}>
                          <div className="user-name" style={{ 
                            fontSize: "2.4rem",
                            fontWeight: "900", 
                            color: "#0b1220",
                            marginBottom: "0.5rem"
                          }}>
                            {u.full_name || `${u.first_name || ""} ${u.last_name || ""}` || u.username}
                          </div>
                          <div className="user-dept" style={{
                            fontSize: "1.35rem",
                            color: "#1e40af",
                            fontWeight: 700,
                            marginBottom: "0.5rem"
                          }}>
                            {u.department || "Unknown"}
                          </div>
                          <div style={{ fontSize: "1.15rem", color: "#0f172a", fontWeight: "600" }}>{u.email || ""}</div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          {editingId === uid ? (
                            <>
                              <button 
                                className="card-btn small" 
                                onClick={saveEdit} 
                                disabled={saving}
                                style={{
                                  padding: "0.75rem 1.5rem",
                                  background: saving ? "#94a3b8" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "10px",
                                  fontSize: "0.95rem",
                                  fontWeight: "600",
                                  cursor: saving ? "not-allowed" : "pointer",
                                  transition: "all 0.3s ease",
                                  boxShadow: "0 3px 10px rgba(16, 185, 129, 0.3)"
                                }}
                              >
                                {saving ? "Saving..." : " Save"}
                              </button>
                              <button 
                                className="card-btn small" 
                                onClick={cancelEdit}
                                style={{
                                  padding: "0.75rem 1.5rem",
                                  background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "10px",
                                  fontSize: "0.95rem",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                  boxShadow: "0 3px 10px rgba(107, 114, 128, 0.3)"
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                className="card-btn small" 
                                onClick={() => startEdit(u)}
                                style={{
                                  padding: "0.75rem 1.5rem",
                                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "10px",
                                  fontSize: "0.95rem",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                  boxShadow: "0 3px 10px rgba(59, 130, 246, 0.3)"
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                className="card-btn small danger" 
                                onClick={() => handleDelete(u)} 
                                disabled={loadingDelete}
                                style={{
                                  padding: "0.75rem 1.5rem",
                                  background: loadingDelete ? "#94a3b8" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "10px",
                                  fontSize: "0.95rem",
                                  fontWeight: "600",
                                  cursor: loadingDelete ? "not-allowed" : "pointer",
                                  transition: "all 0.3s ease",
                                  boxShadow: "0 3px 10px rgba(239, 68, 68, 0.3)"
                                }}
                              >
                                 Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="user-details" style={{ marginTop: "2rem" }}>
                        {editingId === uid ? (
                          <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
                            gap: "1.5rem",
                            padding: "2.25rem",
                            borderRadius: "14px",
                            background: "#ffffff",
                            border: "2px solid #dbeafe",
                            boxShadow: "0 8px 30px rgba(15,23,42,0.04)"
                          }}>
                            {[
                              { name: "username", label: "Username" },
                              { name: "email", label: "Email" },
                              { name: "first_name", label: "First Name" },
                              { name: "last_name", label: "Last Name" },
                              { name: "department", label: "Department" }
                            ].map(({ name, label }) => (
                              <div key={name}>
                                <label className="login-label" style={{ 
                                  display: "block", 
                                  fontSize: "1.5rem",
                                  fontWeight: 700,
                                  color: "#0b1220",
                                  marginBottom: "0.75rem",
                                  alignItems: "center",
                                  gap: "0.5rem"
                                 }}>
                                  {label}
                                </label>
                                <input 
                                  name={name} 
                                  className="login-input" 
                                  value={editForm[name]} 
                                  onChange={handleEditChange} 
                                  style={{ 
                                    width: "100%",
                                    height: "4.75rem",
                                    padding: "0 1rem", 
                                    fontSize: "1.375rem",
                                    borderRadius: "12px",
                                    border: "2px solid #c7ddff",
                                    background: "#ffffff",
                                    color: "#0b1220",
                                    transition: "all 0.2s ease",
                                    fontWeight: 700
                                    }}
                                    onFocus={(e) => {
                                      e.target.style.borderColor = "#2563eb";
                                      e.target.style.boxShadow = "0 0 0 8px rgba(37,99,235,0.08)";
                                    }}
                                    onBlur={(e) => {
                                      e.target.style.borderColor = "#c7ddff";
                                      e.target.style.boxShadow = "none";
                                    }}
                                 />
                               </div>
                             ))}

                            <div style={{ 
                              gridColumn: "1 / -1", 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "1rem", 
                              margin: "1.5rem 0", 
                              padding: "1.5rem",
                              background: "white",
                              borderRadius: "12px",
                              border: "2px dashed #3b82f6",
                              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.1)"
                            }}>
                              <input
                                id={`chgpwd-${uid}`}
                                type="checkbox"
                                checked={changePassword}
                                onChange={() => setChangePassword((s) => !s)}
                                style={{ 
                                  width: "24px", 
                                  height: "24px",
                                  accentColor: "#3b82f6",
                                  cursor: "pointer"
                                }}
                              />
                              <label 
                                htmlFor={`chgpwd-${uid}`} 
                                style={{ 
                                  fontSize: "1.5rem",
                                  fontWeight: 700, 
                                  color: "#1e293b",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem"
                                }}
                              >
                                Change Password
                              </label>
                            </div>

                            {changePassword && (
                              <div style={{ gridColumn: "1 / -1" }}>
                                <label className="login-label" style={{ 
                                  display: "block", 
                                  fontSize: "1.25rem",
                                  fontWeight: 700,
                                  color: "#374151",
                                  marginBottom: "0.5rem",
                                  alignItems: "center",
                                  gap: "0.5rem"
                                }}>
                                  New Password
                                </label>
                                <input 
                                  name="password" 
                                  type="password" 
                                  className="login-input" 
                                  value={editForm.password} 
                                  onChange={handleEditChange}
                                  placeholder="Enter new password"
                                  style={{ 
                                    width: "100%",
                                    height: "4.75rem",
                                    padding: "0 1rem", 
                                    fontSize: "1.375rem",
                                    borderRadius: "12px",
                                    border: "2px solid #c7ddff",
                                    background: "#ffffff",
                                    color: "#0b1220",
                                    transition: "all 0.2s ease",
                                    fontWeight: 700
                                  }}
                                  onFocus={(e) => {
                                    e.target.style.borderColor = "#2563eb";
                                    e.target.style.boxShadow = "0 0 0 8px rgba(37,99,235,0.08)";
                                  }}
                                  onBlur={(e) => {
                                    e.target.style.borderColor = "#c7ddff";
                                    e.target.style.boxShadow = "none";
                                  }}
                                />
                              </div>
                            )}

                            {saveError && (
                              <div className="error-message" style={{ 
                                gridColumn: "1 / -1",
                                padding: "1rem 1.5rem",
                                background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                                border: "2px solid #fecaca",
                                borderRadius: "10px",
                                color: "#dc2626",
                                fontSize: "1rem",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem"
                              }}>
                                {saveError}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="read-only-form" style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
                            gap: "1.5rem",
                            padding: "2.25rem",
                            borderRadius: "14px",
                            background: "#f8fafc",
                            border: "1px solid #e6eef8"
                          }}>
                            {[
                              { value: u.username || "", label: "Username"},
                              { value: u.email || "", label: "Email"},
                              { value: u.first_name || u.firstName || "", label: "First Name"},
                              { value: u.last_name || u.lastName || "", label: "Last Name"},
                              { value: u.department || "", label: "Department"},
                              { value: u.role || u.user_type || "", label: "Role"}
                            ].map(({ value, label }, index) => (
                              <div key={index}>
                                <label className="login-label" style={{ 
                                  display: "block", 
                                  fontSize: "1.125rem",
                                  fontWeight: 600,
                                  color: "#0b1220",
                                  marginBottom: "0.5rem",
                                  alignItems: "center",
                                  gap: "0.5rem"
                                 }}>
                                  {label}
                                </label>
                                <input 
                                  className="login-input" 
                                  value={value} 
                                  disabled
                                  style={{ 
                                    width: "100%",
                                    height: "4rem",
                                    padding: "0 1rem", 
                                    fontSize: "1.125rem",
                                    borderRadius: "10px",
                                    border: "2px solid #e6eef8",
                                    background: "#ffffff",
                                    color: "#0b1220",
                                    fontWeight: 400,
                                    opacity: 1
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}