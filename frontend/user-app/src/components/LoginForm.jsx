import { useState } from 'react'
import { login } from '../services/authService.js'
import '../styles/LoginForm.css'

export default function LoginForm({ onSwitchToRegister, onLoginSuccess, showRegister = true }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const data = await login(email, password);
      setMessage(data.message || 'Login successful');
      setMessageType('success');
      
      // If user data is returned, pass it to parent
      if (data.user && onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error.message || 'Unable to connect to server. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            className={`login-button ${loading ? 'loading' : ''}`} 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {message && (
          <div className={`message ${messageType}`}>
            <span className="message-icon">
              {messageType === 'success' ? '✓' : '✕'}
            </span>
            <span>{message}</span>
          </div>
        )}

        {onSwitchToRegister && showRegister && (
          <div className="switch-form">
            <p>Don't have an account? 
              <button 
                type="button" 
                className="switch-link"
                onClick={onSwitchToRegister}
                disabled={loading}
              >
                Sign Up (First user becomes Admin)
              </button>
            </p>
          </div>
        )}
        {!showRegister && (
          <div className="switch-form">
            <p className="admin-note">
              ℹ️ Admin account already exists. Registration is disabled. Please contact the administrator to create your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

