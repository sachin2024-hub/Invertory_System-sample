import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage.jsx'
import LoginSidePanel from './components/LoginSidePanel.jsx'
import AdminDashboard from './components/admin/AdminDashboard.jsx'
import CashierDashboard from './components/cashier/CashierDashboard.jsx'
import { API_URL } from './utils/constants.js'

export default function App() {
  const [user, setUser] = useState(null);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/check-admin`);
      const data = await response.json();
      setHasAdmin(data.hasAdmin || false);
    } catch (error) {
      console.error('Error checking admin:', error);
      setHasAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setShowLoginPanel(false);
    setTimeout(() => setUser(userData), 400);
  };

  const handleRegisterSuccess = (userData) => {
    setShowLoginPanel(false);
    setTimeout(() => {
      setUser(userData);
      setHasAdmin(true);
    }, 400);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // If user is logged in, show appropriate dashboard based on role
  if (user) {
    if (user.role === 'admin') {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    } else {
      return <CashierDashboard user={user} onLogout={handleLogout} />;
    }
  }

  // Show loading while checking admin
  if (checkingAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <LandingPage onOpenLogin={() => setShowLoginPanel(true)} />
      <LoginSidePanel
        isOpen={showLoginPanel}
        onClose={() => setShowLoginPanel(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        hasAdmin={hasAdmin}
      />
    </>
  );
}