import './App.css';
import Login from './Components/Login.jsx';
import Register from './Components/Register.jsx';
import AdminDashboard from './Components/AdminDashboard.jsx';
import UserDashboard from './Components/UserDashboard.jsx';
import { useState, useEffect } from 'react';

function App() {
  const [authData, setAuthData] = useState(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'register'

  // Check for existing session on app load
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setAuthData(parsedUserData);
      } catch (error) {
        console.error('Invalid userData in localStorage:', error);
        localStorage.removeItem('userData');
      }
    }
  }, []);

  const handleLoginSuccess = (loginData) => {
    // Store user data in localStorage
    localStorage.setItem('userData', JSON.stringify(loginData));
    
    // Set auth data
    setAuthData(loginData);
    
    // Show welcome message if this is a fresh login
    if (loginData.showWelcomeMessage) {
      setShowWelcomeMessage(true);
      // Hide welcome message after 5 seconds
      setTimeout(() => {
        setShowWelcomeMessage(false);
      }, 5000);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await fetch('http://localhost:8000/api/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local data regardless of API call success
      localStorage.removeItem('userData');
      setAuthData(null);
      setShowWelcomeMessage(false);
      setCurrentView('dashboard');
    }
  };

  const handleNavigateToRegister = () => {
    setCurrentView('register');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Function to determine user role
  const getUserRole = (authData) => {
    if (!authData) return 'user';
    
    // Check various possible admin indicators
    if (
      authData.user_type === 'admin' ||
      authData.role === 'admin' ||
      authData.user?.is_superuser ||
      authData.user?.is_staff ||
      authData.is_admin ||
      authData.userRole === 'admin'
    ) {
      return 'admin';
    }
    
    return 'user';
  };

  // Welcome message component
  const WelcomeMessage = () => {
    if (!showWelcomeMessage || !authData?.welcome_message) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#4ade80',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎉</span>
          <span>{authData.welcome_message}</span>
        </div>
        <style>
          {`
            @keyframes slideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}
        </style>
      </div>
    );
  };

  return (
    <>
      <WelcomeMessage />
      {authData ? (
        (() => {
          const userRole = getUserRole(authData);
          
          if (userRole === 'admin') {
            if (currentView === 'register') {
              return (
                <Register 
                  authData={authData} 
                  onBackToLogin={handleBackToDashboard}
                  isAdminView={true}
                />
              );
            }
            return (
              <AdminDashboard 
                authData={authData} 
                onLogout={handleLogout}
                onNavigateToRegister={handleNavigateToRegister}
              />
            );
          } else {
            return <UserDashboard authData={authData} onLogout={handleLogout} />;
          }
        })()
      ) : (
        <Login onLoggedIn={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;