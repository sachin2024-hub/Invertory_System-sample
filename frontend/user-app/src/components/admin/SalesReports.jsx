import { useState, useEffect } from 'react';
import { API_URL } from '../../utils/constants.js';
import '../../styles/admin/ManageProducts.css';

export default function SalesReports() {
  const [period, setPeriod] = useState('monthly');
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ transactionCount: 0, totalRevenue: 0, totalDiscount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSales();
  }, [period]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/api/sales?period=${period}`);
      const data = await res.json();

      if (data.ok) {
        setSales(data.sales || []);
        setSummary(data.summary || { transactionCount: 0, totalRevenue: 0, totalDiscount: 0 });
      } else {
        setError(data.message || 'Failed to load sales');
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Cannot connect to server. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' });
  };

  const periodLabel = { daily: 'Today', weekly: 'Last 7 Days', monthly: 'Last 30 Days' };

  return (
    <div className="manage-section">
      <div className="section-header">
        <h3>Sales Reports</h3>
        <div className="header-buttons" style={{ display: 'flex', gap: 8 }}>
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              type="button"
              className={period === p ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setPeriod(p)}
            >
              {p === 'daily' ? 'Daily' : p === 'weekly' ? 'Weekly' : 'Monthly'} Report
            </button>
          ))}
        </div>
      </div>

      <div className="info-card">
        <div className="info-icon">📈</div>
        <div className="info-content">
          <h4>Sales Analytics</h4>
          <p>
            View detailed sales reports, track revenue, and analyze sales trends for your Sari-Sari store.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="sales-summary" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="summary-card" style={{ flex: 1, minWidth: 160, padding: 20, borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
          <div style={{ fontSize: 14, opacity: 0.9 }}>Total Revenue ({periodLabel[period]})</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>₱{Number(summary.totalRevenue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="summary-card" style={{ flex: 1, minWidth: 140, padding: 20, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 14, color: '#166534', fontWeight: 600 }}>Transactions</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#166534' }}>{summary.transactionCount}</div>
        </div>
        <div className="summary-card" style={{ flex: 1, minWidth: 140, padding: 20, borderRadius: 12, background: '#fef3c7', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: 14, color: '#92400e', fontWeight: 600 }}>Total Discount</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#92400e' }}>₱{Number(summary.totalDiscount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading sales report...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : sales.length === 0 ? (
        <div className="empty-state">
          No sales in this period. Sales will appear here after cashier checkouts.
        </div>
      ) : (
        <div className="products-table-container">
          <h4 style={{ marginBottom: 12 }}>Recent Transactions</h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction #</th>
                <th>Date</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td>{s.transaction_number}</td>
                  <td>{formatDate(s.created_at)}</td>
                  <td>₱{Number(s.subtotal || 0).toFixed(2)}</td>
                  <td>₱{Number(s.discount_amount || 0).toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>₱{Number(s.total_amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
