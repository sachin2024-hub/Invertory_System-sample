import { useState, useEffect } from 'react'
import '../../styles/admin/ManageCustomers.css'

import { API_URL } from '../../utils/constants.js'

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    address: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/customers`);
      const data = await response.json();
      
      if (data.ok) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!formData.name) {
      setMessage('Name is required');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create customer';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.ok) {
        setMessage('Customer created successfully!');
        setMessageType('success');
        setFormData({
          name: '',
          phone_number: '',
          address: '',
          email: ''
        });
        setShowForm(false);
        fetchCustomers();
      } else {
        setMessage(data.message || 'Failed to create customer');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        setMessage('Cannot connect to server. Please make sure the backend server is running on port 5000.');
      } else {
        setMessage(error.message || 'Unable to connect to server. Please check if backend is running.');
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-section">
      <div className="section-header">
        <h3>Customer Management</h3>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add New Customer'}
        </button>
      </div>

      {showForm && (
        <form className="customer-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="09XX XXX XXXX"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email (Optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@email.com"
              />
            </div>
            <div className="form-group">
              <label>Address (Optional)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
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
              {loading ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </form>
      )}

      <div className="info-card">
        <div className="info-icon">👥</div>
        <div className="info-content">
          <h4>Manage Store Customers</h4>
          <p>Keep track of your regular customers, their purchase history, and contact information for your Sari-Sari store.</p>
        </div>
      </div>

      <div className="customers-table-container">
        {loading && customers.length === 0 ? (
          <div className="loading-state">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">No customers found. Add your first customer above!</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Address</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="customer-name">{customer.name}</td>
                  <td>{customer.phone_number || 'N/A'}</td>
                  <td>{customer.email || 'N/A'}</td>
                  <td>{customer.address || 'N/A'}</td>
                  <td>{customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
