import { useEffect, useState } from "react";
import { API_URL } from "../../utils/constants.js";

export default function NewSale({ user }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      if (data.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/customers`);
      const data = await res.json();
      if (data.ok) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };

  const handleAddToCart = () => {
    setMessage("");
    setMessageType("");

    if (!selectedProductId) {
      setMessage("Please select a product.");
      setMessageType("error");
      return;
    }

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setMessage("Quantity must be at least 1.");
      setMessageType("error");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          quantity: qty,
        },
      ];
    });
    setQuantity(1);
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = subtotal >= 5000 ? subtotal * 0.3 : 0;
  const total = subtotal - discount;

  const handleCheckout = async () => {
    setMessage("");
    setMessageType("");

    if (cart.length === 0) {
      setMessage("Please add at least one product to the cart.");
      setMessageType("error");
      return;
    }

    if (!selectedCustomerId && !newCustomerName) {
      setMessage("Please select a customer or enter a new customer name.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          price: item.price,
          name: item.name,
        })),
        customer_id: selectedCustomerId || null,
        new_customer: !selectedCustomerId && newCustomerName
          ? { name: newCustomerName, phone_number: newCustomerPhone || null }
          : null,
        cashier_id: user?.id || null,
        subtotal,
        discount_amount: discount,
        total_amount: total,
      };

      const res = await fetch(`${API_URL}/api/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ok) {
        setCart([]);
        setSelectedProductId("");
        setQuantity(1);
        setSelectedCustomerId("");
        setNewCustomerName("");
        setNewCustomerPhone("");
        setMessage("Transaction completed successfully. Stock updated.");
        setMessageType("success");
        fetchProducts();
        fetchCustomers();
      } else {
        setMessage(data.message || "Checkout failed.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setMessage("Unable to complete checkout. Please check if the server is running.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-section">
      <div className="section-header">
        <h3>New Sale / Transaction</h3>
      </div>

      {/* Product selection */}
      <div className="info-card">
        <div className="info-icon">🛒</div>
        <div className="info-content">
          <h4>Select Products</h4>
          <p>
            Choose products, set quantity, and the system will auto-calculate
            your total. A 30% discount is automatically applied when the total
            reaches ₱5,000 or more.
          </p>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Product</label>
          <select
            className="form-input"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ₱{Number(p.price).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input
            type="number"
            className="form-input"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ alignSelf: "flex-end" }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Cart table */}
      <div className="products-table-container" style={{ marginTop: 16 }}>
        {cart.length === 0 ? (
          <div className="empty-state">
            No items in cart. Add products above.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>₱{item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>₱{(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer selection */}
      <div className="info-card" style={{ marginTop: 24 }}>
        <div className="info-icon">👥</div>
        <div className="info-content">
          <h4>Customer Input / Select Customer</h4>
          <p>
            Select an existing customer or register a new one for this
            transaction.
          </p>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Returning Customer</label>
          <select
            className="form-input"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="">Select existing customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone_number ? `(${c.phone_number})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">New Customer Name</label>
          <input
            className="form-input"
            type="text"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">New Customer Contact</label>
          <input
            className="form-input"
            type="text"
            value={newCustomerPhone}
            onChange={(e) => setNewCustomerPhone(e.target.value)}
            placeholder="09XX XXX XXXX"
          />
        </div>
      </div>

      {/* Discount / total summary */}
      <div className="info-card warning" style={{ marginTop: 24 }}>
        <div className="info-icon">💸</div>
        <div className="info-content">
          <h4>View Discount Applied</h4>
          <p>
            The system automatically applies a <strong>30% discount</strong>{" "}
            when the subtotal reaches <strong>₱5,000</strong> or more.
          </p>
          <p>
            <strong>Subtotal:</strong> ₱{subtotal.toFixed(2)} <br />
            <strong>Discount (30% if ≥ ₱5,000):</strong> ₱{discount.toFixed(2)}{" "}
            <br />
            <strong>Total to Pay:</strong> ₱{total.toFixed(2)}
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`form-message ${
            messageType === "success" ? "success" : "error"
          }`}
          style={{ marginTop: 16 }}
        >
          {message}
        </div>
      )}

      <div className="form-actions" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn-primary"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm & Checkout"}
        </button>
      </div>
    </div>
  );
}

