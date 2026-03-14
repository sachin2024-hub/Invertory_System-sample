import { useState } from 'react'
import '../../styles/cashier/CashierDashboard.css'
import NewSale from './NewSale.jsx'
import ViewProducts from './ViewProducts.jsx'
import ViewSoldOut from './ViewSoldOut.jsx'
import ViewCustomers from './ViewCustomers.jsx'
import ViewDiscount from './ViewDiscount.jsx'

export default function CashierDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('new-sale');
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'new-sale', label: 'New Sale / Transaction', icon: '🛒' },
    { id: 'products', label: 'View Products (Read-Only)', icon: '📦' },
    { id: 'discount', label: 'View Discount Applied', icon: '💸' },
    { id: 'customers', label: 'View Customers', icon: '👥' },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'new-sale':
        return <NewSale user={user} />;
      case 'products':
        return <ViewProducts />;
      case 'discount':
        return <ViewDiscount />;
      case 'customers':
        return <ViewCustomers />;
      default:
        return <NewSale />;
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`cashier-dashboard-container ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar */}
      <div className="cashier-sidebar">
        <div className="sidebar-header">
          <h1 className="store-logo">🏪 Sari-Sari Store</h1>
          <p className="store-subtitle">Cashier Portal</p>
        </div>

        <div className="user-info">
          <div className="user-avatar-large">
            {user?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name || 'Cashier'}</p>
            <p className="user-role">Cashier</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Toggle button pinned on the edge */}
      <button
        type="button"
        className={`sidebar-toggle ${collapsed ? 'collapsed' : ''}`}
        onClick={toggleSidebar}
        aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
      >
        {collapsed ? '▶' : '◀'}
      </button>

      {/* Main Content */}
      <div className="cashier-main-content">
        <div className="content-header">
          <h2 className="page-title">
            {menuItems.find(item => item.id === activeMenu)?.icon}{' '}
            {menuItems.find(item => item.id === activeMenu)?.label}
          </h2>
          <div className="header-actions">
            <span className="welcome-text">Welcome, {user?.name || 'Cashier'}!</span>
          </div>
        </div>

        <div className="content-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

