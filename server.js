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
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir));

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  res.json({
    success: true,
    url,
  });
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

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

app.get("/", (req, res) => {
  res.send("API online");
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

    const data = req.body || {};

    const existing = await query("SELECT id FROM site_settings LIMIT 1");

    const columnsResult = await query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'site_settings'
    `, ["u584951003_NOVOREDIRECT"]);

    const validColumns = new Set(
      columnsResult.map((row) => row.COLUMN_NAME)
    );

    const filteredEntries = Object.entries(data)
      .filter(([key]) => validColumns.has(key));

    if (filteredEntries.length === 0) {
      return res.status(400).json({
        error: "Nenhum campo válido para salvar"
      });
    }

    const fields = filteredEntries.map(([key]) => key);
    const values = filteredEntries.map(([, value]) => value);

    if (existing.length > 0) {

      const id = existing[0].id;

      const setClause = fields
        .map((f) => `${f} = ?`)
        .join(", ");

      await query(
        `UPDATE site_settings SET ${setClause} WHERE id = ?`,
        [...values, id]
      );

    } else {

      const placeholders = fields
        .map(() => "?")
        .join(", ");

      await query(
        `INSERT INTO site_settings (${fields.join(", ")})
         VALUES (${placeholders})`,
        values
      );
    }

    const saved = await query(
      "SELECT * FROM site_settings LIMIT 1"
    );

    res.json({
      success: true,
      settings: saved[0] || {}
    });

  } catch (err) {

    console.error("ERRO AO SALVAR CONFIGURAÇÕES:", err);

    res.status(500).json({
      error: err.message,
      sqlMessage: err.sqlMessage || null,
      code: err.code || null,
    });
  }
});

/* =========================
START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});