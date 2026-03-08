import express from "express";
import cors from "cors";
import mysql from "mysql2";

const app = express();

app.use(cors());
app.use(express.json());

/*
CONEXÃO MYSQL (HOSTINGER)
*/
const db = mysql.createPool({
  host: "srv1664.hstgr.io",
  user: "u584951003_NOVOREDIRECT01",
  password: "@Isantos2012",
  database: "u584951003_NOVOREDIRECT",
  port: 3306,
  connectionLimit: 10
});

/*
TESTE DE CONEXÃO
*/
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ ERRO MYSQL:", err);
  } else {
    console.log("✅ Conectado ao MySQL");
    connection.release();
  }
});

/*
PRODUTOS
*/
app.get("/api/products", (req, res) => {

  db.query("SELECT * FROM products", (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar produtos" });
    }

    res.json(results);

  });

});

/*
SABORES
*/
app.get("/api/flavors", (req, res) => {

  db.query("SELECT * FROM flavors", (err, results) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);

  });

});

/*
BANNERS
*/
app.get("/api/banners", (req, res) => {

  db.query("SELECT * FROM banners", (err, results) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);

  });

});

/*
CONFIGURAÇÕES
*/
app.get("/api/settings", (req, res) => {

  db.query("SELECT * FROM site_settings LIMIT 1", (err, results) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(results[0] || {});

  });

});

/*
INICIAR SERVIDOR
*/
app.listen(3000, () => {

  console.log("🚀 API rodando em http://localhost:3000");

});