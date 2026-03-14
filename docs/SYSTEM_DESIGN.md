-# Sari-Sari Store Inventory System
## Complete System Design & Documentation

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Features](#features)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Structure](#frontend-structure)
7. [Technology Stack](#technology-stack)
8. [Implementation Guide](#implementation-guide)

---

## 🏪 System Overview

The **Sari-Sari Store Inventory System** is a comprehensive inventory management solution designed specifically for small convenience stores (Sari-Sari stores) in the Philippines. The system helps store owners and cashiers manage products, track inventory, process sales, and generate reports.

### Key Objectives
- Manage product inventory (candies, snacks, drinks, basic groceries)
- Track stock levels and low stock alerts
- Process sales transactions
- Manage customer information
- Generate sales reports
- Role-based access control (Admin & Cashier)

---

## ✨ Features

### Admin Features
- ✅ **Product Management**: Add, edit, delete products (Coca-Cola, Chippy, Cloud 9, etc.)
- ✅ **Category Management**: Organize products by categories (Beverages, Snacks, Cigarettes, etc.)
- ✅ **Inventory Tracking**: Monitor stock levels, set reorder points
- ✅ **User Management**: Create and manage cashier accounts
- ✅ **Customer Management**: Maintain customer database
- ✅ **Sales Reports**: View daily, weekly, monthly sales reports
- ✅ **Low Stock Alerts**: Get notified when products are running low
- ✅ **Sales History**: View all past transactions

### Cashier Features
- ✅ **Process Sales**: Create sales transactions
- ✅ **View Products**: Browse available products and prices
- ✅ **Check Stock**: View current stock levels
- ✅ **Sold-Out Items**: See which products are out of stock
- ✅ **Customer Lookup**: Search for existing customers

---

## 👥 User Roles & Permissions

### 🔴 Admin Role
**Full system access**
- Manage all products and categories
- Add/Edit/Delete products
- Manage inventory and stock levels
- Create and manage cashier accounts
- View all sales reports and analytics
- Manage customer database
- Set reorder points and low stock alerts

### 🟢 Cashier Role
**Limited access for daily operations**
- Process sales transactions
- View product list and prices
- Check stock availability
- View sold-out items
- Search customers
- Cannot modify products or inventory

---

## 🗄️ Database Schema

### Tables Structure

#### 1. **users** (User Accounts)
```sql
- id (UUID, Primary Key)
- name (TEXT)
- email (TEXT, Unique)
- password (TEXT) - hashed
- role (TEXT) - 'admin' or 'cashier'
- phone_number (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 2. **categories** (Product Categories)
```sql
- id (UUID, Primary Key)
- name (TEXT, Unique) - e.g., "Beverages", "Snacks", "Cigarettes"
- description (TEXT)
- created_at (TIMESTAMP)
```

#### 3. **products** (Store Products)
```sql
- id (UUID, Primary Key)
- name (TEXT) - e.g., "Coca-Cola 500ml", "Chippy Original"
- barcode (TEXT, Unique)
- category_id (UUID, Foreign Key → categories)
- description (TEXT)
- price (DECIMAL) - selling price
- cost (DECIMAL) - purchase cost
- stock_quantity (INTEGER) - current stock
- reorder_point (INTEGER) - minimum stock alert
- unit (TEXT) - "piece", "pack", "bottle", "box"
- image_url (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 4. **customers** (Customer Database)
```sql
- id (UUID, Primary Key)
- name (TEXT)
- phone_number (TEXT)
- address (TEXT)
- email (TEXT)
- created_at (TIMESTAMP)
```

#### 5. **sales** (Sales Transactions)
```sql
- id (UUID, Primary Key)
- transaction_number (TEXT, Unique)
- customer_id (UUID, Foreign Key → customers, nullable)
- cashier_id (UUID, Foreign Key → users)
- total_amount (DECIMAL)
- payment_method (TEXT) - "cash", "gcash", "paymaya"
- status (TEXT) - "completed", "cancelled"
- created_at (TIMESTAMP)
```

#### 6. **sale_items** (Sales Line Items)
```sql
- id (UUID, Primary Key)
- sale_id (UUID, Foreign Key → sales)
- product_id (UUID, Foreign Key → products)
- quantity (INTEGER)
- unit_price (DECIMAL)
- subtotal (DECIMAL)
- created_at (TIMESTAMP)
```

#### 7. **inventory_logs** (Stock Movement History)
```sql
- id (UUID, Primary Key)
- product_id (UUID, Foreign Key → products)
- type (TEXT) - "purchase", "sale", "adjustment", "return"
- quantity (INTEGER) - positive for add, negative for subtract
- reference_id (UUID) - links to sale_id or purchase_id
- notes (TEXT)
- created_by (UUID, Foreign Key → users)
- created_at (TIMESTAMP)
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login          - Login (Admin/Cashier)
POST   /api/auth/logout          - Logout
GET    /api/auth/me             - Get current user
```

### Products
```
GET    /api/products            - Get all products (with filters)
GET    /api/products/:id        - Get single product
POST   /api/products             - Create product (Admin only)
PUT    /api/products/:id         - Update product (Admin only)
DELETE /api/products/:id         - Delete product (Admin only)
GET    /api/products/low-stock  - Get low stock products
```

### Categories
```
GET    /api/categories           - Get all categories
POST   /api/categories           - Create category (Admin only)
PUT    /api/categories/:id      - Update category (Admin only)
DELETE /api/categories/:id       - Delete category (Admin only)
```

### Sales
```
GET    /api/sales                - Get all sales (with filters)
GET    /api/sales/:id            - Get single sale with items
POST   /api/sales                - Create new sale (Cashier/Admin)
GET    /api/sales/reports/daily  - Daily sales report (Admin only)
GET    /api/sales/reports/weekly - Weekly sales report (Admin only)
GET    /api/sales/reports/monthly - Monthly sales report (Admin only)
```

### Customers
```
GET    /api/customers            - Get all customers
GET    /api/customers/:id        - Get single customer
POST   /api/customers            - Create customer
PUT    /api/customers/:id        - Update customer
DELETE /api/customers/:id        - Delete customer (Admin only)
```

### Inventory
```
GET    /api/inventory            - Get inventory status
GET    /api/inventory/logs       - Get inventory movement logs
POST   /api/inventory/adjust     - Adjust stock (Admin only)
```

### Users (Admin only)
```
GET    /api/users                - Get all users
POST   /api/users                - Create user (cashier)
PUT    /api/users/:id            - Update user
DELETE /api/users/:id            - Delete/deactivate user
```

---

## 🎨 Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products/
│   │   │   │   ├── ProductList.jsx
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   └── ProductCard.jsx
│   │   │   ├── Categories/
│   │   │   │   ├── CategoryList.jsx
│   │   │   │   └── CategoryForm.jsx
│   │   │   ├── Inventory/
│   │   │   │   ├── InventoryList.jsx
│   │   │   │   ├── LowStockAlerts.jsx
│   │   │   │   └── StockAdjustment.jsx
│   │   │   ├── Sales/
│   │   │   │   ├── SalesList.jsx
│   │   │   │   ├── SalesReport.jsx
│   │   │   │   └── SalesChart.jsx
│   │   │   ├── Customers/
│   │   │   │   ├── CustomerList.jsx
│   │   │   │   └── CustomerForm.jsx
│   │   │   └── Users/
│   │   │       ├── UserList.jsx
│   │   │       └── UserForm.jsx
│   │   ├── cashier/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PointOfSale/
│   │   │   │   ├── POS.jsx
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   └── PaymentModal.jsx
│   │   │   ├── Products/
│   │   │   │   └── ProductView.jsx
│   │   │   └── StockCheck.jsx
│   │   └── shared/
│   │       ├── Layout.jsx
│   │       ├── Sidebar.jsx
│   │       ├── Navbar.jsx
│   │       └── ProtectedRoute.jsx
│   ├── services/
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── saleService.js
│   │   ├── customerService.js
│   │   └── inventoryService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── formatters.js
│   └── styles/
├── App.jsx
└── main.jsx
```

---

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express.js**
- **Supabase** (PostgreSQL database)
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend
- **React** + **Vite**
- **React Router** for navigation
- **Axios** for API calls
- **CSS Modules** / **Tailwind CSS** for styling

---

## 📝 Implementation Guide

### Phase 1: Database Setup
1. Create all tables in Supabase
2. Set up relationships and foreign keys
3. Create indexes for performance
4. Set up Row Level Security (RLS) policies

### Phase 2: Backend API
1. Set up Express server
2. Implement authentication middleware
3. Create role-based access control
4. Implement all API endpoints
5. Add input validation

### Phase 3: Frontend
1. Set up React application
2. Implement authentication flow
3. Create Admin dashboard
4. Create Cashier POS interface
5. Implement all CRUD operations

### Phase 4: Testing & Deployment
1. Test all features
2. Fix bugs
3. Deploy backend
4. Deploy frontend

---

## 🔐 Security Considerations

- Password hashing with bcrypt
- JWT token authentication
- Role-based route protection
- Input validation and sanitization
- SQL injection prevention (Supabase handles this)
- CORS configuration

---

## 📊 Example Data

### Sample Products
- Coca-Cola 500ml - ₱25.00
- Chippy Original - ₱10.00
- Cloud 9 Chocolate - ₱8.00
- Lucky Me Pancit Canton - ₱12.00
- Royal Orange 500ml - ₱20.00
- Marlboro Red - ₱85.00

### Sample Categories
- Beverages
- Snacks
- Cigarettes
- Instant Noodles
- Candies
- Basic Groceries

---

*This system is designed specifically for Sari-Sari stores to efficiently manage inventory and sales operations.*

