import { useState, useEffect } from 'react';
import LoginForm from './LoginForm.jsx';
import RegisterForm from './RegisterForm.jsx';
import LoginHistory from './LoginHistory.jsx';
import '../styles/LoginSidePanel.css';

const LOGIN_HISTORY_KEY = 'sarisari_login_history';
const MAX_HISTORY = 5;

function saveLoginHistory(email) {
  try {
    const raw = localStorage.getItem(LOGIN_HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const entry = { email, timestamp: new Date().toISOString() };
    const updated = [entry, ...list.filter((e) => e.email !== email)].slice(0, MAX_HISTORY);
    localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save login history', e);
  }
}

export default function LoginSidePanel({ isOpen, onClose, onLoginSuccess, onRegisterSuccess, hasAdmin }) {
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLoginSuccess = (user) => {
    saveLoginHistory(user?.email || '');
    onLoginSuccess(user);
  };

  const handleRegisterSuccess = (user) => {
    saveLoginHistory(user?.email || '');
    onRegisterSuccess(user);
  };

  return (
    <>
      <div
        className={`login-panel-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close login panel"
      />
      <aside
        className={`login-side-panel ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="Login"
      >
        <div className="login-panel-header">
          <h2 className="login-panel-title">{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <button
            type="button"
            className="login-panel-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="login-panel-body">
          {isLogin ? (
            <LoginForm
              onSwitchToRegister={() => setIsLogin(false)}
              onLoginSuccess={handleLoginSuccess}
              showRegister={!hasAdmin}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setIsLogin(true)}
              onRegisterSuccess={handleRegisterSuccess}
              disabled={hasAdmin}
            />
          )}

          <div className="login-panel-divider" />

          <LoginHistory />
        </div>
      </aside>
    </>
  );
}
