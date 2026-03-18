import { useState, useEffect } from 'react'
import '../../styles/admin/ManageProducts.css'
import { API_URL } from '../../utils/constants.js'

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const pageSize = 10;

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
      const url = editingProduct ? `${API_URL}/api/products/${editingProduct.id}` : `${API_URL}/api/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
        setMessage(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
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
        setEditingProduct(null);
        fetchProducts();
      } else {
        setMessage(data.message || 'Failed to create product');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error saving product:', error);
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

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      barcode: product.barcode || '',
      category_id: product.category_id || '',
      description: product.description || '',
      price: product.price ?? '',
      cost: product.cost ?? '',
      stock_quantity: product.stock_quantity ?? '',
      reorder_point: product.reorder_point ? String(product.reorder_point) : '10',
      unit: product.unit || 'piece'
    });
    setShowForm(true);
  };

  const handleDeleteClick = async (product) => {
    if (!window.confirm(`Delete product "${product.name}"?`)) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }
      setMessage('Product deleted successfully');
      setMessageType('success');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage(error.message || 'Failed to delete product');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(products.length / pageSize) || 1;
  const clampedPage = Math.min(currentPage, totalPages);
  const startIndex = (clampedPage - 1) * pageSize;
  const paginatedProducts = products.slice(startIndex, startIndex + pageSize);

  return (
    <div className="manage-section">
      <div className="section-header">
        <h3>Product Management</h3>
        <button 
          className="btn-primary" 
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingProduct(null);
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
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? '✕ Cancel' : (editingProduct ? 'Edit Product' : '+ Add New Product')}
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
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
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
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => handleEditClick(product)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDeleteClick(product)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="table-pagination">
                <button
                  type="button"
                  disabled={clampedPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span>
                  Page {clampedPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={clampedPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
