import { useState, useEffect } from "react";
import { API_URL } from "../../utils/constants.js";

export default function ViewSoldOut() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSoldOut();
  }, []);

  const fetchSoldOut = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();

      if (data.ok) {
        const all = data.products || [];
        const soldOut = all.filter(
          (p) =>
            Number(p.stock_quantity) <= 0 ||
            Number(p.stock_quantity) <= Number(p.reorder_point || 0)
        );
        setProducts(soldOut);
      } else {
        setError(data.message || "Failed to load products");
      }
    } catch (err) {
      console.error("Error fetching sold-out products:", err);
      setError("Cannot connect to server. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-section">
      <div className="section-header">
        <h3>Sold-Out / Low Stock Products</h3>
      </div>

      {loading ? (
        <div className="loading-state">Loading products...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : products.length === 0 ? (
        <div className="empty-state">No sold-out products right now.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
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

