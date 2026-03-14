import { useState, useEffect } from "react";
import { API_URL } from "../../utils/constants.js";

export default function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();

      if (data.ok) {
        setProducts(data.products || []);
      } else {
        setError(data.message || "Failed to load products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Cannot connect to server. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-section">
      <div className="section-header">
        <h3>View Products (Read Only)</h3>
        <span className="read-only-badge">View Only</span>
      </div>

      {loading ? (
        <div className="loading-state">Loading products...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          No products found. Ask the admin to add products.
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>₱{Number(p.price).toFixed(2)}</td>
                <td>{p.stock_quantity}</td>
                <td>{p.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

