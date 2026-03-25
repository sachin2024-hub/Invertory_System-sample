import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '../../utils/constants.js';

function formatMoney(value) {
  const n = Number(value || 0);
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AdminOverview({ user, onNavigate }) {
  const [products, setProducts] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({
    transactionCount: 0,
    totalRevenue: 0,
    totalDiscount: 0,
  });
  const [dailySales, setDailySales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [pRes, mRes, dRes] = await Promise.all([
          fetch(`${API_URL}/api/products`),
          fetch(`${API_URL}/api/sales?period=monthly`),
          fetch(`${API_URL}/api/sales?period=daily`),
        ]);

        const pData = await pRes.json();
        const mData = await mRes.json();
        const dData = await dRes.json();

        if (pData.ok) setProducts(pData.products || []);
        if (mData.ok) setMonthlySummary(mData.summary || { transactionCount: 0, totalRevenue: 0, totalDiscount: 0 });
        if (dData.ok) setDailySales(dData.sales || []);
      } catch (e) {
        console.error('AdminOverview load error:', e);
        setError('Unable to load dashboard data. Please check backend/API URL.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const lowStockProducts = useMemo(() => {
    return (products || []).filter((p) => {
      const threshold = p.reorder_point || 10;
      return Number(p.stock_quantity || 0) <= Number(threshold);
    });
  }, [products]);

  const recentTransactions = dailySales.slice(0, 5);

  return (
    <div className="manage-section">
      <div className="section-header">
        <h3>Dashboard</h3>
        <div className="header-buttons">
          <button type="button" className="btn-secondary" onClick={() => onNavigate?.('products')}>
            Manage Products
          </button>
          <button type="button" className="btn-secondary" onClick={() => onNavigate?.('inventory')}>
            Inventory
          </button>
          <button type="button" className="btn-secondary" onClick={() => onNavigate?.('reports')}>
            Reports
          </button>
          <button type="button" className="btn-secondary" onClick={() => onNavigate?.('settings')}>
            Settings
          </button>
        </div>
      </div>

      {loading ? (
        <div className="placeholder-content">Loading dashboard...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <>
          <div className="overview-stats-grid">
            <div className="overview-stat-card overview-stat-revenue">
              <div className="overview-stat-label">Total Revenue (Last 30 Days)</div>
              <div className="overview-stat-value">{formatMoney(monthlySummary.totalRevenue)}</div>
            </div>
            <div className="overview-stat-card overview-stat-transactions">
              <div className="overview-stat-label">Transactions</div>
              <div className="overview-stat-value">{monthlySummary.transactionCount}</div>
            </div>
            <div className="overview-stat-card overview-stat-lowstock">
              <div className="overview-stat-label">Low Stock Products</div>
              <div className="overview-stat-value">{lowStockProducts.length}</div>
            </div>
          </div>

          <div className="overview-two-col">
            <div className="overview-col">
              <div className="overview-card">
                <h4 className="overview-card-title">Recent Transactions</h4>
                {recentTransactions.length === 0 ? (
                  <div className="empty-state">No transactions today yet.</div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Transaction #</th>
                        <th>Date</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((s) => (
                        <tr key={s.id}>
                          <td>{s.transaction_number}</td>
                          <td>{formatDate(s.created_at)}</td>
                          <td style={{ fontWeight: 600 }}> {formatMoney(s.total_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="overview-col">
              <div className="overview-card">
                <h4 className="overview-card-title">Low Stock Products</h4>
                {lowStockProducts.length === 0 ? (
                  <div className="empty-state">All products are in good condition.</div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.slice(0, 5).map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.stock_quantity}</td>
                          <td>
                            <span className="status-badge low-stock">Low Stock</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24 }} />
          <div className="info-card">
            <div className="info-icon">💡</div>
            <div className="info-content">
              <h4>Welcome back, {user?.name || 'Admin'} 👋</h4>
              <p>
                Use the menu on the left to manage products, monitor inventory, and view sales reports.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

