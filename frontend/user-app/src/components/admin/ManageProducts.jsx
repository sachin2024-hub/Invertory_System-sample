import { useState, useEffect } from 'react'
import '../../styles/admin/ManageProducts.css'
import { API_URL } from '../../utils/constants.js'

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category_id: '',
    description: '',
    price: '',
    cost: '',
    stock_quantity: '',
    reorder_point: '10',
    unit: 'piece'
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      
      if (data.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!formData.name || !formData.price || !formData.stock_quantity) {
      setMessage('Name, price, and stock quantity are required');
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create product';
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
        setMessage('Product created successfully!');
        setMessageType('success');
        setFormData({
          name: '',
          barcode: '',
          category_id: '',
          description: '',
          price: '',
          cost: '',
          stock_quantity: '',
          reorder_point: '10',
          unit: 'piece'
        });
        setShowForm(false);
        fetchProducts();
      } else {
        setMessage(data.message || 'Failed to create product');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error creating product:', error);
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
        <h3>Product Management</h3>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add New Product'}
        </button>
      </div>

      {showForm && (
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Coca-Cola 500ml"
                required
              />
            </div>
            <div className="form-group">
              <label>Barcode (Optional)</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Enter barcode"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₱) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="25.00"
                required
              />
            </div>
            <div className="form-group">
              <label>Cost (₱) (Optional)</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="20.00"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                placeholder="100"
                required
              />
            </div>
            <div className="form-row-inline">
              <div className="form-group">
                <label>Reorder Point</label>
                <input
                  type="number"
                  value={formData.reorder_point}
                  onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                  placeholder="10"
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="piece">Piece</option>
                  <option value="pack">Pack</option>
                  <option value="bottle">Bottle</option>
                  <option value="box">Box</option>
                  <option value="kg">Kilogram</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description..."
              rows="3"
            />
          </div>

          {message && (
            <div className={`form-message ${messageType}`}>
              {messageType === 'success' ? '✓' : '✕'} {message}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      )}

      <div className="info-card">
        <div className="info-icon">📦</div>
        <div className="info-content">
          <h4>Manage Store Products</h4>
          <p>Add, edit, and manage all products in your Sari-Sari store. Track items like Coca-Cola, Chippy, Cloud 9, and other store items.</p>
        </div>
      </div>

      <div className="products-table-container">
        {loading && products.length === 0 ? (
          <div className="loading-state">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products found. Add your first product above!</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="product-name">{product.name}</td>
                  <td>₱{parseFloat(product.price).toFixed(2)}</td>
                  <td>{product.stock_quantity}</td>
                  <td>{product.unit}</td>
                  <td>
                    {product.stock_quantity <= (product.reorder_point || 10) ? (
                      <span className="status-badge low-stock">Low Stock</span>
                    ) : (
                      <span className="status-badge in-stock">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
