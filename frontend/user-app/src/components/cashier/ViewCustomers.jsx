import { useState, useEffect } from "react";
import { API_URL } from "../../utils/constants.js";

export default function ViewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/customers`);
      const data = await res.json();

      if (data.ok) {
        setCustomers(data.customers || []);
      } else {
        setError(data.message || "Failed to load customers");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Cannot connect to server. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-section">
      <div className="section-header">
        <h3>View Customers (Read Only)</h3>
        <span className="read-only-badge">View Only</span>
        <button
          type="button"
          className="btn-secondary"
          onClick={fetchCustomers}
          disabled={loading}
          style={{ marginLeft: "auto" }}
        >
          Refresh
        </button>
      </div>

      <div className="info-card">
        <div className="info-icon">👥</div>
        <div className="info-content">
          <h4>Browse Store Customers</h4>
          <p>
            View customer information. New customers added during checkout will appear here.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading customers...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          No customers yet. Add a new customer during checkout.
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Address</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.phone_number || "—"}</td>
                <td>{c.address || "—"}</td>
                <td>{c.email || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
