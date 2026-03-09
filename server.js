import express from "express";
import cors from "cors";
import mysql from "mysql2";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

/* =========================
   UPLOADS
========================= */

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir));

app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao fazer upload" });
  }
});

/* =========================
   MYSQL
========================= */

const db = mysql.createPool({
  host: "srv1664.hstgr.io",
  user: "u584951003_NOVOREDIRECT01",
  password: "@Isantos2012",
  database: "u584951003_NOVOREDIRECT",
  port: 3306,
  connectionLimit: 10,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ ERRO MYSQL:", err);
  } else {
    console.log("✅ Conectado ao MySQL");
    connection.release();
  }
});

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function normalizeFlavorIds(flavorIds) {
  if (!flavorIds) return JSON.stringify([]);

  if (Array.isArray(flavorIds)) {
    return JSON.stringify(flavorIds.map(Number).filter(Boolean));
  }

  if (typeof flavorIds === "string") {
    try {
      const parsed = JSON.parse(flavorIds);

      if (Array.isArray(parsed)) {
        return JSON.stringify(parsed.map(Number).filter(Boolean));
      }

      if (typeof parsed === "string") {
        const parsedAgain = JSON.parse(parsed);
        if (Array.isArray(parsedAgain)) {
          return JSON.stringify(parsedAgain.map(Number).filter(Boolean));
        }
      }
    } catch (e) {
      const splitIds = flavorIds
        .split(",")
        .map((id) => Number(String(id).trim()))
        .filter(Boolean);

      return JSON.stringify(splitIds);
    }
  }

  return JSON.stringify([]);
}

app.get("/", (req, res) => {
  res.send("API online");
});

/* =========================
   PRODUCTS
========================= */

app.get("/api/products", async (req, res) => {
  try {
    const results = await query("SELECT * FROM products ORDER BY id DESC");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const results = await query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    res.json(results[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      image_url,
      is_active,
      is_featured,
      low_stock_threshold,
      flavor_ids,
    } = req.body;

    const result = await query(
      `INSERT INTO products
      (name, description, price, category, stock, image_url, is_active, is_featured, low_stock_threshold, flavor_ids)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name || "",
        description || "",
        price || 0,
        category || "",
        stock || 0,
        image_url || "",
        is_active ?? 1,
        is_featured ?? 0,
        low_stock_threshold ?? 5,
        normalizeFlavorIds(flavor_ids),
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      image_url,
      is_active,
      is_featured,
      low_stock_threshold,
      flavor_ids,
    } = req.body;

    await query(
      `UPDATE products SET
      name = ?, description = ?, price = ?, category = ?, stock = ?,
      image_url = ?, is_active = ?, is_featured = ?, low_stock_threshold = ?, flavor_ids = ?
      WHERE id = ?`,
      [
        name || "",
        description || "",
        price || 0,
        category || "",
        stock || 0,
        image_url || "",
        is_active ?? 1,
        is_featured ?? 0,
        low_stock_threshold ?? 5,
        normalizeFlavorIds(flavor_ids),
        req.params.id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir produto" });
  }
});

/* =========================
   FLAVORS
========================= */

app.get("/api/flavors", async (req, res) => {
  try {
    const results = await query("SELECT * FROM flavors ORDER BY id DESC");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar sabores" });
  }
});

app.post("/api/flavors", async (req, res) => {
  try {
    const { name, is_active } = req.body;

    const result = await query(
      `INSERT INTO flavors (name, is_active)
       VALUES (?, ?)`,
      [name || "", is_active ?? 1]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar sabor" });
  }
});

app.put("/api/flavors/:id", async (req, res) => {
  try {
    const { name, is_active } = req.body;

    await query(
      `UPDATE flavors
       SET name = ?, is_active = ?
       WHERE id = ?`,
      [name || "", is_active ?? 1, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar sabor" });
  }
});

app.delete("/api/flavors/:id", async (req, res) => {
  try {
    await query("DELETE FROM flavors WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir sabor" });
  }
});

/* =========================
   BANNERS
========================= */

app.get("/api/banners", async (req, res) => {
  try {
    const results = await query("SELECT * FROM banners ORDER BY `order` ASC, id DESC");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar banners" });
  }
});

app.post("/api/banners", async (req, res) => {
  try {
    const { title, subtitle, image_url, is_active, order } = req.body;

    const result = await query(
      `INSERT INTO banners (title, subtitle, image_url, is_active, \`order\`)
       VALUES (?, ?, ?, ?, ?)`,
      [title || "", subtitle || "", image_url || "", is_active ?? 1, order ?? 0]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar banner" });
  }
});

app.put("/api/banners/:id", async (req, res) => {
  try {
    const { title, subtitle, image_url, is_active, order } = req.body;

    await query(
      `UPDATE banners
       SET title = ?, subtitle = ?, image_url = ?, is_active = ?, \`order\` = ?
       WHERE id = ?`,
      [title || "", subtitle || "", image_url || "", is_active ?? 1, order ?? 0, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar banner" });
  }
});

app.delete("/api/banners/:id", async (req, res) => {
  try {
    await query("DELETE FROM banners WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir banner" });
  }
});

/* =========================
   ORDERS
========================= */

app.get("/api/orders", async (req, res) => {
  try {
    const results = await query("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const results = await query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar pedido" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      address,
      items,
      subtotal,
      delivery_fee,
      total,
      status,
    } = req.body;

    const result = await query(
      `INSERT INTO orders
      (customer_name, customer_phone, address, items, subtotal, delivery_fee, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_name || "",
        customer_phone || "",
        JSON.stringify(address || {}),
        JSON.stringify(items || []),
        subtotal || 0,
        delivery_fee || 0,
        total || 0,
        status || "pending",
      ]
    );

    res.json({
      success: true,
      id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar pedido" });
  }
});

app.put("/api/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;

    await query(
      `UPDATE orders
       SET status = ?
       WHERE id = ?`,
      [status, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar pedido" });
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  try {
    await query("DELETE FROM orders WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir pedido" });
  }
});

/* =========================
   SETTINGS
========================= */

app.get("/api/settings", async (req, res) => {
  try {
    const results = await query("SELECT * FROM site_settings LIMIT 1");
    res.json(results[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar configurações" });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const data = req.body;

    const existing = await query("SELECT id FROM site_settings LIMIT 1");
    const fields = [
      "store_name",
      "whatsapp_number",
      "logo_url",
      "header_text",

      "primary_color",
      "button_color",
      "background_color",
      "header_color",
      "cart_color",

      "delivery_fee",
      "min_order_value",

      "free_shipping_enabled",
      "free_shipping_threshold",
      "free_shipping_text",
      "free_shipping_remaining_text",
      "free_shipping_success_text",

      "show_fake_reviews",
      "fake_rating",
      "fake_reviews_count",

      "opening_time",
      "closing_time",
      "is_open_override",
      "closed_message"
    ];

    const values = fields.map(f => data[f] ?? null);

    if (existing.length > 0) {
      const id = existing[0].id;
      const setClause = fields.map(f => `${f} = ?`).join(", ");

      await query(
        `UPDATE site_settings SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
    } else {
      const placeholders = fields.map(() => "?").join(", ");

      await query(
        `INSERT INTO site_settings (${fields.join(",")})
        VALUES (${placeholders})`,
        values
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar configurações" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});