import { useState, useEffect } from 'react'
import '../styles/Dashboard.css'

const API_URL = 'http://localhost:5000';

export default function Dashboard({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users`);
      const data = await response.json();
      
      if (data.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.message || 'Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="user-greeting">
              <h1 className="dashboard-title">Welcome, {user?.name || 'User'}! 👋</h1>
              <p className="dashboard-subtitle">Your Supabase Dashboard</p>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              <span>🚪</span>
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <h3>Your Account</h3>
              <p className="stat-value">{user?.email || 'N/A'}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-value">{users.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Status</h3>
              <p className="stat-value">Active</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-section">
          <div className="section-header">
            <h2 className="section-title">📋 All Users from Supabase</h2>
            <button className="refresh-btn" onClick={fetchUsers} disabled={loading}>
              {loading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading users from Supabase...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon">❌</span>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchUsers}>Try Again</button>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No users found in Supabase</p>
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className={u.id === user?.id ? 'current-user' : ''}>
                      <td className="user-id">{u.id.substring(0, 8)}...</td>
                      <td className="user-name">
                        <span className="name-avatar">{u.name?.charAt(0).toUpperCase() || 'U'}</span>
                        {u.name}
                      </td>
                      <td className="user-email">{u.email}</td>
                      <td className="user-date">{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="info-card">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h3>Connected to Supabase</h3>
            <p>All user data is stored in your Supabase database. This dashboard shows real-time data from your Supabase 'users' table.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

