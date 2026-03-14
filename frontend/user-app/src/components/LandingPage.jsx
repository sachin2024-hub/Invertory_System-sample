export default function LandingPage({ onOpenLogin }) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-brand">
          <h1 className="landing-logo">Sari-Sari Store</h1>
          <p className="landing-tagline">Inventory System</p>
        </div>
        <p className="landing-description">
          Manage your store inventory, track sales, and serve customers efficiently.
        </p>
        <button type="button" className="landing-login-btn" onClick={onOpenLogin}>
          Login
        </button>
      </div>
    </div>
  );
}
