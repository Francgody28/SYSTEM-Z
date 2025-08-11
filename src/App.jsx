import './App.css';
import Login from './Components/Login.jsx';
import Register from './Components/Register.jsx';
import { useState, useEffect } from 'react';

function App() {
  const [authData, setAuthData] = useState(null);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setAuthData({
          token,
          user: parsedUserData,
          is_superuser: true
        });
      } catch (error) {
        console.error('Invalid userData in localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setAuthData(null);
  };

  return (
    <>
      {authData ? (
        <Register 
          authData={authData} 
          onBackToLogin={handleLogout} 
        />
      ) : (
        <Login onLoggedIn={setAuthData} />
      )}
    </>
  );
}

export default App;