import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

// Supabase connection - MUST be before routes
const supabaseUrl = "https://hsgloysswerxirzeynwl.supabase.co"; // Fixed: supabase.co (not suppabase.co)
const supabaseKey = "sb_publishable_k2hNarOj0j1rXpOLGOPETw_JZkITGez";

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection on startup
console.log(" Testing Supabase connection...");
supabase.from('users').select('count').limit(1)
  .then(() => console.log(" Supabase connected successfully"))
  .catch((error) => {
    console.error("❌ Supabase connection error:", error.message);
    console.error("💡 Make sure 'users' table exists in Supabase");
  });

// CORS - allow localhost (dev) and production URLs (Vercel, Render)
const allowedOrigins = [
  'http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174',
  'https://inventory-system-sample-jzcf.vercel.app',
  'https://invertory-system-sample.onrender.com',
  /^https:\/\/inventory-system-sample[^.]*\.vercel\.app$/,
  /^https:\/\/invertory-system-sample[^.]*\.vercel\.app$/
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    cb(null, ok ? origin : false);
  },
  credentials: true
}));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ ok: false, message: 'Internal server error' });
});

app.get("/", (req, res) => res.send("Backend is running"));

// Check if admin exists
app.get("/api/auth/check-admin", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (error) {
      return res.status(500).json({ ok: false, hasAdmin: false });
    }

    return res.status(200).json({ ok: true, hasAdmin: data && data.length > 0 });
  } catch (error) {
    return res.status(500).json({ ok: false, hasAdmin: false });
  }
});

// Get all users from Supabase (Admin only)
app.get("/api/users", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone_number, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ ok: false, message: error.message });
    }

    return res.status(200).json({ ok: true, users: data || [] });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Create new user (Admin only)
app.post("/api/users", async (req, res) => {
  const { name, email, password, role, phone_number } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ ok: false, message: "Name, email, password, and role are required" });
  }

  if (password.length < 4) {
    return res.status(400).json({ ok: false, message: "Password must be at least 4 characters" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, message: "Invalid email format" });
  }

  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ ok: false, message: "Email already registered" });
    }

    const userData = { name, email, password, role: role || 'cashier' };
    if (phone_number) {
      userData.phone_number = phone_number;
    }

    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select('id, name, email, role, phone_number');

    if (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ ok: false, message: error.message });
    }

    return res.status(200).json({ ok: true, user: data[0] });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt:", { email, password: password ? "***" : "missing" });

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "Email and password are required" });
  }

  try {
    // Check if user exists in Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ ok: false, message: "Invalid email or password" });
    }

    // Simple password comparison (NOT SECURE for production - use bcrypt!)
    if (data.password === password) {
      return res.status(200).json({ 
        ok: true, 
        message: "Login successful",
        user: { 
          id: data.id, 
          name: data.name, 
          email: data.email,
          role: data.role || 'cashier' // Return user role
        }
      });
  }

  return res.status(401).json({ ok: false, message: "Invalid email or password" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ ok: false, message: "Server error. Please try again." });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword, phone_number } = req.body;

  console.log("Register attempt:", { name, email, password: password ? "***" : "missing", phone_number: phone_number ? "***" : "missing" });

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ ok: false, message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ ok: false, message: "Passwords do not match" });
  }

  if (password.length < 4) {
    return res.status(400).json({ ok: false, message: "Password must be at least 4 characters" });
  }

  if (phone_number && String(phone_number).length < 10) {
    return res.status(400).json({ ok: false, message: "Invalid phone number" });
  }

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, message: "Invalid email format" });
  }

  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ ok: false, message: "Email already registered" });
    }

    // Check if admin already exists
    const { data: adminCheck } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    // If admin exists, block registration - only admin can create users
    if (adminCheck && adminCheck.length > 0) {
      return res.status(403).json({ 
        ok: false, 
        message: "Registration is disabled. Admin account already exists. Please contact the administrator to create your account." 
      });
    }

    // First registration becomes admin
    const userRole = 'admin';

    // Insert new user to Supabase
    // ⚠️ NOTE: In production, hash the password with bcrypt!
    const userData = { name, email, password, role: userRole };
    if (phone_number) {
      userData.phone_number = phone_number;
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return res.status(500).json({ 
          ok: false, 
          message: "Database table 'users' not found. Please create it in Supabase." 
        });
      }
      return res.status(500).json({ 
        ok: false, 
        message: `Registration failed: ${error.message}` 
      });
    }

    console.log("✅ User registered:", data[0].email, "Role:", userRole);
    return res.status(200).json({ 
      ok: true, 
      message: "Registration successful! You can now login.",
      user: { 
        id: data[0].id, 
        name: data[0].name, 
        email: data[0].email,
        role: userRole
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ 
      ok: false, 
      message: `Server error: ${error.message}` 
    });
  }
});

// ============================================
// PRODUCTS API ENDPOINTS
// ============================================

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ ok: false, message: error.message });
    }

    return res.status(200).json({ ok: true, products: data || [] });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Create new product
app.post("/api/products", async (req, res) => {
  const { name, barcode, category_id, description, price, cost, stock_quantity, reorder_point, unit } = req.body;

  if (!name || !price || stock_quantity === undefined) {
    return res.status(400).json({ ok: false, message: "Name, price, and stock quantity are required" });
  }

  if (price <= 0) {
    return res.status(400).json({ ok: false, message: "Price must be greater than 0" });
  }

  try {
    const productData = {
      name,
      barcode: barcode || null,
      category_id: category_id || null,
      description: description || null,
      price: parseFloat(price),
      cost: cost ? parseFloat(cost) : null,
      stock_quantity: parseInt(stock_quantity),
      reorder_point: reorder_point ? parseInt(reorder_point) : 10,
      unit: unit || 'piece'
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select('*');

    if (error) {
      console.error("Error creating product:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // Provide more specific error messages
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return res.status(500).json({ 
          ok: false, 
          message: "Products table not found. Please run CREATE_TABLES.sql in Supabase to create the tables." 
        });
      }
      
      return res.status(500).json({ ok: false, message: error.message || 'Failed to create product' });
    }

    console.log("✅ Product created:", data[0].name);
    return res.status(200).json({ ok: true, product: data[0] });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// ============================================
// CUSTOMERS API ENDPOINTS
// ============================================

// Get all customers
app.get("/api/customers", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching customers:", error);
      return res.status(500).json({ ok: false, message: error.message });
    }

    return res.status(200).json({ ok: true, customers: data || [] });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Create new customer
app.post("/api/customers", async (req, res) => {
  const { name, phone_number, address, email } = req.body;

  if (!name) {
    return res.status(400).json({ ok: false, message: "Name is required" });
  }

  try {
    const customerData = {
      name,
      phone_number: phone_number || null,
      address: address || null,
      email: email || null
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select('*');

    if (error) {
      console.error("Error creating customer:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // Provide more specific error messages
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return res.status(500).json({ 
          ok: false, 
          message: "Customers table not found. Please run CREATE_TABLES.sql in Supabase to create the tables." 
        });
      }
      
      return res.status(500).json({ ok: false, message: error.message || 'Failed to create customer' });
    }

    console.log("✅ Customer created:", data[0].name);
    return res.status(200).json({ ok: true, customer: data[0] });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// ============================================
// SALES API ENDPOINTS
// ============================================

// Get sales (for reports) - optional ?period=daily|weekly|monthly
app.get("/api/sales", async (req, res) => {
  const { period } = req.query;

  try {
    let query = supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (period === 'daily' || period === 'weekly' || period === 'monthly') {
      const now = new Date();
      let start = new Date(now);

      if (period === 'daily') {
        start.setHours(0, 0, 0, 0);
      } else if (period === 'weekly') {
        start.setDate(start.getDate() - 7);
      } else if (period === 'monthly') {
        start.setMonth(start.getMonth() - 1);
      }
      const startStr = start.toISOString();
      query = query.gte('created_at', startStr);
    }

    const { data: sales, error } = await query;

    if (error) {
      console.error("Error fetching sales:", error);
      if (error.message?.includes('does not exist') || error.code === 'PGRST116') {
        return res.status(500).json({ ok: false, message: "Sales table not found. Run SALES_TABLES.sql in Supabase." });
      }
      return res.status(500).json({ ok: false, message: error.message });
    }

    const list = sales || [];
    const totalRevenue = list.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
    const totalDiscount = list.reduce((sum, s) => sum + parseFloat(s.discount_amount || 0), 0);

    return res.status(200).json({
      ok: true,
      sales: list,
      summary: {
        transactionCount: list.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalDiscount: Math.round(totalDiscount * 100) / 100
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Create sale (checkout) - saves transaction, deducts stock, creates customer if new
app.post("/api/sales", async (req, res) => {
  const { items, customer_id, new_customer, cashier_id, subtotal, discount_amount, total_amount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ ok: false, message: "Cart items are required" });
  }

  if (!customer_id && !new_customer?.name) {
    return res.status(400).json({ ok: false, message: "Select a customer or enter new customer name" });
  }

  if (subtotal === undefined || total_amount === undefined) {
    return res.status(400).json({ ok: false, message: "Subtotal and total amount are required" });
  }

  try {
    let finalCustomerId = customer_id;

    // Create new customer if provided
    if (!customer_id && new_customer?.name) {
      const { data: newCust, error: custErr } = await supabase
        .from('customers')
        .insert([{
          name: new_customer.name,
          phone_number: new_customer.phone_number || null,
          address: null,
          email: null
        }])
        .select('id')
        .single();

      if (custErr) {
        console.error("Error creating customer:", custErr);
        return res.status(500).json({ ok: false, message: custErr.message || "Failed to create customer" });
      }
      finalCustomerId = newCust.id;
    }

    // Validate stock before proceeding
    for (const item of items) {
      const { data: prod } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (!prod) {
        return res.status(400).json({ ok: false, message: `Product not found: ${item.product_id}` });
      }
      const currentStock = parseInt(prod.stock_quantity) || 0;
      const qty = parseInt(item.quantity) || 0;
      if (qty > currentStock) {
        return res.status(400).json({ ok: false, message: `Insufficient stock for "${prod.name}". Available: ${currentStock}` });
      }
    }

    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Create sale record
    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .insert([{
        transaction_number: transactionNumber,
        customer_id: finalCustomerId || null,
        cashier_id: cashier_id || null,
        subtotal: parseFloat(subtotal),
        discount_amount: parseFloat(discount_amount || 0),
        total_amount: parseFloat(total_amount)
      }])
      .select('id')
      .single();

    if (saleErr) {
      console.error("Error creating sale:", saleErr);
      if (saleErr.message?.includes('does not exist') || saleErr.code === 'PGRST116') {
        return res.status(500).json({ ok: false, message: "Sales table not found. Run SALES_TABLES.sql in Supabase." });
      }
      return res.status(500).json({ ok: false, message: saleErr.message });
    }

    // Create sale items and deduct stock
    for (const item of items) {
      const sub = parseFloat(item.unit_price || item.price) * parseInt(item.quantity);
      await supabase.from('sale_items').insert([{
        sale_id: sale.id,
        product_id: item.product_id,
        product_name: item.name || item.product_name,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price || item.price),
        subtotal: sub
      }]);

      const { data: prod } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      const newStock = Math.max(0, (parseInt(prod?.stock_quantity) || 0) - parseInt(item.quantity));
      await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.product_id);
    }

    console.log("✅ Sale completed:", transactionNumber);
    return res.status(200).json({ ok: true, sale: { id: sale.id, transaction_number: transactionNumber } });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running: http://localhost:${port}`));

export default app;