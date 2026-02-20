import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CategoryView from './pages/CategoryView';
import Returns from './pages/Returns';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import './index.css';
import { setAuthToken } from './services/api';

function App() {
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setAuthToken(storedToken);
    }
    setInitializing(false);
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
    setAuthToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
    setAuthToken(null);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-dark">Loading...</div>
      </div>
    );
  }

  const isAuthenticated = Boolean(token);

  return (
    <Router>
      <div className="min-h-screen bg-bg">
        {isAuthenticated && <Navbar onLogout={handleLogout} />}
        <div className={isAuthenticated ? 'pt-16' : ''}>
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/"
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/category/:categoryName"
              element={
                isAuthenticated ? (
                  <CategoryView />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/returns"
              element={
                isAuthenticated ? <Returns /> : <Navigate to="/login" replace />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

