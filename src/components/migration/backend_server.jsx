// ============================================================
// BACKEND — Node.js + Express
// Arquivo: server.js
// Instalar: npm install express mysql2 cors multer jsonwebtoken bcryptjs dotenv
// Rodar: node server.js
// ============================================================

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// ---- Servir imagens enviadas ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- Multer (upload de imagens) ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
  }
});
const upload = multer({ storage });

// ---- Conexão MySQL ----
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
});

// ---- Helper: parse JSON fields ----
function parseJsonFields(rows, fields) {
  return rows.map(row => {
    const parsed = { ...row };
    fields.forEach(f => {
      if (parsed[f] && typeof parsed[f] === 'string') {
        try { parsed[f] = JSON.parse(parsed[f]); } catch {}
      }
    });
    return parsed;
  });
}

// ---- Middleware de autenticação JWT ----
const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_aqui';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Não autorizado' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// ============================================================
// AUTH
// ============================================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // SIMPLES: comparar com variáveis de ambiente
  // Para produção, use uma tabela de usuários no banco
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { email, role: 'admin' } });
  }
  res.status(401).json({ error: 'Email ou senha incorretos' });
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// ============================================================
// UPLOAD
// ============================================================

// POST /api/upload
app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  const file_url = `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/${req.file.filename}`;
  res.json({ file_url });
});

// ============================================================
// PRODUTOS
// ============================================================

// GET /api/products
app.get('/api/products', async (req, res) => {
  const { is_active, is_featured } = req.query;
  let q = 'SELECT * FROM products';
  const where = [];
  if (is_active !== undefined) where.push(`is_active = ${is_active === 'true' ? 1 : 0}`);
  if (is_featured !== undefined) where.push(`is_featured = ${is_featured === 'true' ? 1 : 0}`);
  if (where.length) q += ' WHERE ' + where.join(' AND ');
  q += ' ORDER BY created_at DESC';
  const [rows] = await pool.execute(q);
  res.json(parseJsonFields(rows, ['flavor_ids']));
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json(parseJsonFields(rows, ['flavor_ids'])[0] || null);
});

// POST /api/products
app.post('/api/products', authMiddleware, async (req, res) => {
  const { name, description, price, image_url, category, stock, is_active, is_featured, low_stock_threshold, flavor_ids } = req.body;
  const [result] = await pool.execute(
    'INSERT INTO products (name, description, price, image_url, category, stock, is_active, is_featured, low_stock_threshold, flavor_ids) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [name, description||null, price, image_url||null, category||null, stock||0, is_active!==false?1:0, is_featured?1:0, low_stock_threshold||5, JSON.stringify(flavor_ids||[])]
  );
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [result.insertId]);
  res.json(parseJsonFields(rows, ['flavor_ids'])[0]);
});

// PUT /api/products/:id
app.put('/api/products/:id', authMiddleware, async (req, res) => {
  const allowed = ['name','description','price','image_url','category','stock','is_active','is_featured','low_stock_threshold','flavor_ids'];
  const fields = [], vals = [];
  allowed.forEach(k => {
    if (req.body[k] !== undefined) {
      fields.push(`${k} = ?`);
      vals.push(k === 'flavor_ids' ? JSON.stringify(req.body[k]) : (k === 'is_active' || k === 'is_featured') ? (req.body[k] ? 1 : 0) : req.body[k]);
    }
  });
  vals.push(req.params.id);
  await pool.execute(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, vals);
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json(parseJsonFields(rows, ['flavor_ids'])[0]);
});

// DELETE /api/products/:id
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ============================================================
// SABORES
// ============================================================

app.get('/api/flavors', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM flavors ORDER BY name ASC');
  res.json(rows);
});

app.post('/api/flavors', authMiddleware, async (req, res) => {
  const { name, is_active } = req.body;
  const [result] = await pool.execute('INSERT INTO flavors (name, is_active) VALUES (?,?)', [name, is_active !== false ? 1 : 0]);
  const [rows] = await pool.execute('SELECT * FROM flavors WHERE id = ?', [result.insertId]);
  res.json(rows[0]);
});

app.put('/api/flavors/:id', authMiddleware, async (req, res) => {
  const fields = [], vals = [];
  if (req.body.name !== undefined) { fields.push('name = ?'); vals.push(req.body.name); }
  if (req.body.is_active !== undefined) { fields.push('is_active = ?'); vals.push(req.body.is_active ? 1 : 0); }
  vals.push(req.params.id);
  await pool.execute(`UPDATE flavors SET ${fields.join(', ')} WHERE id = ?`, vals);
  const [rows] = await pool.execute('SELECT * FROM flavors WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

app.delete('/api/flavors/:id', authMiddleware, async (req, res) => {
  await pool.execute('DELETE FROM flavors WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ============================================================
// BANNERS
// ============================================================

app.get('/api/banners', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM banners ORDER BY `order` ASC');
  res.json(rows);
});

app.post('/api/banners', authMiddleware, async (req, res) => {
  const { title, subtitle, image_url, is_active, order } = req.body;
  const [result] = await pool.execute(
    'INSERT INTO banners (title, subtitle, image_url, is_active, `order`) VALUES (?,?,?,?,?)',
    [title, subtitle||null, image_url||null, is_active!==false?1:0, order||0]
  );
  const [rows] = await pool.execute('SELECT * FROM banners WHERE id = ?', [result.insertId]);
  res.json(rows[0]);
});

app.put('/api/banners/:id', authMiddleware, async (req, res) => {
  const fields = [], vals = [];
  ['title','subtitle','image_url','is_active','order'].forEach(k => {
    if (req.body[k] !== undefined) {
      fields.push(k === 'order' ? '`order` = ?' : `${k} = ?`);
      vals.push(k === 'is_active' ? (req.body[k] ? 1 : 0) : req.body[k]);
    }
  });
  vals.push(req.params.id);
  await pool.execute(`UPDATE banners SET ${fields.join(', ')} WHERE id = ?`, vals);
  const [rows] = await pool.execute('SELECT * FROM banners WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

app.delete('/api/banners/:id', authMiddleware, async (req, res) => {
  await pool.execute('DELETE FROM banners WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ============================================================
// PEDIDOS
// ============================================================

app.get('/api/orders', authMiddleware, async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
  res.json(parseJsonFields(rows, ['address', 'items']));
});

app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  res.json(parseJsonFields(rows, ['address', 'items'])[0] || null);
});

app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_phone, address, items, subtotal, delivery_fee, total, status } = req.body;
  const [result] = await pool.execute(
    'INSERT INTO orders (customer_name, customer_phone, address, items, subtotal, delivery_fee, total, status) VALUES (?,?,?,?,?,?,?,?)',
    [customer_name, customer_phone||null, JSON.stringify(address||{}), JSON.stringify(items||[]), subtotal||0, delivery_fee||0, total||0, status||'pending']
  );
  const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [result.insertId]);
  res.json(parseJsonFields(rows, ['address', 'items'])[0]);
});

app.put('/api/orders/:id', authMiddleware, async (req, res) => {
  const fields = [], vals = [];
  ['customer_name','customer_phone','address','items','subtotal','delivery_fee','total','status'].forEach(k => {
    if (req.body[k] !== undefined) {
      fields.push(`${k} = ?`);
      vals.push(['address','items'].includes(k) ? JSON.stringify(req.body[k]) : req.body[k]);
    }
  });
  vals.push(req.params.id);
  await pool.execute(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, vals);
  const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  res.json(parseJsonFields(rows, ['address', 'items'])[0]);
});

app.delete('/api/orders/:id', authMiddleware, async (req, res) => {
  await pool.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ============================================================
// CONFIGURAÇÕES
// ============================================================

app.get('/api/settings', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM site_settings LIMIT 1');
  res.json(rows[0] || {});
});

app.put('/api/settings', authMiddleware, async (req, res) => {
  const [existing] = await pool.execute('SELECT id FROM site_settings LIMIT 1');
  const fields = ['store_name','logo_url','whatsapp_number','primary_color','button_color','background_color','header_text','delivery_fee','min_order_value','opening_time','closing_time','is_open_override','closed_message'];
  if (existing.length > 0) {
    const f = [], v = [];
    fields.forEach(k => { if (req.body[k] !== undefined) { f.push(`${k} = ?`); v.push(k === 'is_open_override' ? (req.body[k] ? 1 : 0) : req.body[k]); } });
    v.push(existing[0].id);
    await pool.execute(`UPDATE site_settings SET ${f.join(', ')} WHERE id = ?`, v);
  } else {
    const cols = fields.filter(k => req.body[k] !== undefined);
    const vals = cols.map(k => k === 'is_open_override' ? (req.body[k] ? 1 : 0) : req.body[k]);
    await pool.execute(`INSERT INTO site_settings (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`, vals);
  }
  const [rows] = await pool.execute('SELECT * FROM site_settings LIMIT 1');
  res.json(rows[0]);
});

// ============================================================
// START
// ============================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));