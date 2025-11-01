import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VerifyMagicLink from './pages/VerifyMagicLink';
import ManageOKRs from './pages/ManageOKRs';
import History from './pages/History';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (userId) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userId) => {
    localStorage.setItem('userId', userId);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/auth/verify/:token" element={<VerifyMagicLink onLogin={handleLogin} />} />

        <Route
          path="/"
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        <Route
          path="/okrs"
          element={isAuthenticated ? <ManageOKRs onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        <Route
          path="/history"
          element={isAuthenticated ? <History onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
