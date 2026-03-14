import { useState, useEffect } from "react";
import { API_URL } from "../../utils/constants.js";

export default function ViewDiscount() {
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

  const exampleTotal = 5000;
  const exampleDiscount = exampleTotal * 0.3;
  const exampleFinal = exampleTotal - exampleDiscount;

  return (
    <div className="manage-section">
      <div className="section-header">
        <h3>View Discount Applied</h3>
      </div>

      <div className="info-card warning">
        <div className="info-icon">💸</div>
        <div className="info-content">
          <h4>Automatic 30% Discount Rule</h4>
          <p>
            The system automatically applies a <strong>30% discount</strong> to
            the transaction when the subtotal reaches{" "}
            <strong>₱5,000 or more</strong>. This helps ensure consistent and
            error‑free discount implementation.
          </p>
          <p>
            <strong>Example:</strong> If the subtotal is ₱{exampleTotal.toFixed(2)},<br />
            Discount = 30% = ₱{exampleDiscount.toFixed(2)},<br />
            Final Total = ₱{exampleFinal.toFixed(2)}.
          </p>
        </div>
      </div>

      <div className="info-card">
        <div className="info-icon">📦</div>
        <div className="info-content">
          <h4>Products Eligible for Discounts</h4>
          <p>
            All products added to a transaction contribute to the subtotal used
            to calculate the 30% discount. Below is a read‑only view of current
            products.
          </p>
        </div>
      </div>

      <div className="products-table-container">
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
    </div>
  );
}

