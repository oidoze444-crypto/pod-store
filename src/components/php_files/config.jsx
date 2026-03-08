<?php
// config.php - Configurações do banco de dados
// Coloque este arquivo FORA do public_html por segurança, ou proteja com .htaccess

define('DB_HOST', 'localhost'); // Na Hostinger geralmente é localhost
define('DB_USER', 'seu_usuario_mysql');
define('DB_PASS', 'sua_senha_mysql');
define('DB_NAME', 'seu_banco_mysql');

// URL base da sua API (onde este arquivo está hospedado)
define('ALLOWED_ORIGIN', '*'); // Troque pelo seu domínio em produção: 'https://seudominio.com.br'

function getConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode(['error' => 'Erro de conexão: ' . $conn->connect_error]));
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}

function setCorsHeaders() {
    header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json; charset=utf-8');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}