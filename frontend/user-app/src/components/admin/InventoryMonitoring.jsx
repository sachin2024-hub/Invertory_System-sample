import { useState, useEffect } from 'react';
import { API_URL } from '../../utils/constants.js';
import '../../styles/admin/ManageProducts.css';

export default function InventoryMonitoring() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();

      if (data.ok) {
        setProducts(data.products || []);
      } else {
        setError(data.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Cannot connect to server. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const lowStock = products.filter((p) => (parseInt(p.stock_quantity) || 0) <= (parseInt(p.reorder_point) || 10));
  const outOfStock = products.filter((p) => (parseInt(p.stock_quantity) || 0) <= 0);

  return (
    <div className="manage-section">
      <div className="section-header">
        <h3>Inventory Monitoring</h3>
        <button type="button" className="btn-secondary" onClick={fetchProducts} disabled={loading}>
          Refresh Stock
        </button>
      </div>

      <div className="info-card">
        <div className="info-icon">📊</div>
        <div className="info-content">
          <h4>Track Store Inventory</h4>
          <p>
            Monitor stock levels, set reorder points, and get alerts when products are running low in your Sari-Sari store.
          </p>
        </div>
      </div>

      <div className="inventory-summary" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140, padding: 16, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 14, color: '#166534', fontWeight: 600 }}>Total Products</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#166534' }}>{products.length}</div>
        </div>
        <div style={{ flex: 1, minWidth: 140, padding: 16, borderRadius: 12, background: '#fef3c7', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: 14, color: '#92400e', fontWeight: 600 }}>Low Stock</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#92400e' }}>{lowStock.length}</div>
        </div>
        <div style={{ flex: 1, minWidth: 140, padding: 16, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: 14, color: '#991b1b', fontWeight: 600 }}>Out of Stock</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#991b1b' }}>{outOfStock.length}</div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div style={{ marginBottom: 24, padding: 16, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Low Stock Alert</h4>
          <p style={{ margin: 0, fontSize: 14, color: '#92400e' }}>
            The following products are at or below reorder point and may need restocking.
          </p>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading inventory...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : products.length === 0 ? (
        <div className="empty-state">No products found. Add products in Manage Products.</div>
      ) : (
        <div className="products-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Reorder Point</th>
                <th>Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = parseInt(p.stock_quantity) || 0;
                const reorder = parseInt(p.reorder_point) || 10;
                const isLow = stock <= reorder;
                const isOut = stock <= 0;
                let status = 'OK';
                let statusStyle = { padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 };
                if (isOut) {
                  status = 'Out of Stock';
                  statusStyle = { ...statusStyle, background: '#fecaca', color: '#991b1b' };
                } else if (isLow) {
                  status = 'Low Stock';
                  statusStyle = { ...statusStyle, background: '#fef3c7', color: '#92400e' };
                } else {
                  status = 'In Stock';
                  statusStyle = { ...statusStyle, background: '#dcfce7', color: '#166534' };
                }
                const rowStyle = isOut ? { background: '#fef2f2' } : isLow ? { background: '#fffbeb' } : {};
                return (
                  <tr key={p.id} style={rowStyle}>
                    <td>{p.name}</td>
                    <td>₱{Number(p.price).toFixed(2)}</td>
                    <td>{stock}</td>
                    <td>{reorder}</td>
                    <td>{p.unit || 'piece'}</td>
                    <td><span style={statusStyle}>{status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
