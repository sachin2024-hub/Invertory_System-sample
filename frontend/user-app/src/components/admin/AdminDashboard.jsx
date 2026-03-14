import { useState } from 'react'
import '../../styles/admin/AdminDashboard.css'
import ManageProducts from './ManageProducts.jsx'
import ManageCustomers from './ManageCustomers.jsx'
import ManageUsers from './ManageUsers.jsx'
import InventoryMonitoring from './InventoryMonitoring.jsx'
import SalesReports from './SalesReports.jsx'

export default function AdminDashboard({ user, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('products');
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'products', label: 'Manage Products', icon: '📦' },
    { id: 'customers', label: 'Manage Customers', icon: '👥' },
    { id: 'users', label: 'Manage Users', icon: '👤' },
    { id: 'inventory', label: 'Inventory Monitoring', icon: '📊' },
    { id: 'reports', label: 'Sales Reports', icon: '📈' },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'products':
        return <ManageProducts />;
      case 'customers':
        return <ManageCustomers />;
      case 'users':
        return <ManageUsers currentUser={user} />;
      case 'inventory':
        return <InventoryMonitoring />;
      case 'reports':
        return <SalesReports />;
      default:
        return <ManageProducts />;
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`admin-dashboard-container ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h1 className="store-logo">🏪 Sari-Sari Store</h1>
          <p className="store-subtitle">Inventory System</p>
        </div>

        <div className="user-info">
          <div className="user-avatar-large">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name || 'Admin'}</p>
            <p className="user-role">Administrator</p>
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
        className={`admin-sidebar-toggle ${collapsed ? 'collapsed' : ''}`}
        onClick={toggleSidebar}
        aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
      >
        {collapsed ? '▶' : '◀'}
      </button>

      {/* Main Content */}
      <div className="admin-main-content">
        <div className="content-header">
          <h2 className="page-title">
            {menuItems.find(item => item.id === activeMenu)?.icon}{' '}
            {menuItems.find(item => item.id === activeMenu)?.label}
          </h2>
          <div className="header-actions">
            <span className="welcome-text">Welcome, {user?.name || 'Admin'}!</span>
          </div>
        </div>

        <div className="content-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

