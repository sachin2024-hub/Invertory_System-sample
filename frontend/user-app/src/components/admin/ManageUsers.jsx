import { useState, useEffect } from 'react'
import '../../styles/admin/ManageUsers.css'

const API_URL = 'http://localhost:5000';

export default function ManageUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'cashier',
    phone_number: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    if (formData.password.length < 4) {
      setMessage('Password must be at least 4 characters');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone_number: formData.phone_number
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setMessage('User created successfully!');
        setMessageType('success');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'cashier',
          phone_number: ''
        });
        setShowForm(false);
        fetchUsers();
      } else {
        setMessage(data.message || 'Failed to create user');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage('Unable to connect to server');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-section">
      <div className="section-header">
        <h3>User Management</h3>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add New User'}
        </button>
      </div>

      {showForm && (
        <form className="user-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {message && (
            <div className={`form-message ${messageType}`}>
              {messageType === 'success' ? '✓' : '✕'} {message}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      )}

      <div className="users-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan="5" className="loading-cell">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-cell">No users found</td>
              </tr>
            ) : (() => {
              const otherUsers = users.filter((u) => !currentUser?.id || u.id !== currentUser.id);
              if (otherUsers.length === 0) {
                return (
                  <tr>
                    <td colSpan="5" className="empty-cell">No other users. Add new users above.</td>
                  </tr>
                );
              }
              return otherUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>
                        {u.role === 'admin' ? '👑 Admin' : '💼 Cashier'}
                      </span>
                    </td>
                    <td>{u.phone_number || 'N/A'}</td>
                    <td>
                      <span className="status-badge active">Active</span>
                    </td>
                  </tr>
                ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
