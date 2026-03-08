<?php
// upload.php - Upload de imagens
require_once 'config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Método não permitido']);
    exit();
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['error' => 'Nenhum arquivo enviado']);
    exit();
}

$file = $_FILES['file'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxSize = 5 * 1024 * 1024; // 5MB

// Validações
if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['error' => 'Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WEBP.']);
    exit();
}
if ($file['size'] > $maxSize) {
    echo json_encode(['error' => 'Arquivo muito grande. Máximo 5MB.']);
    exit();
}

// Gera nome único
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '.' . strtolower($ext);
$uploadDir = __DIR__ . '/uploads/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$destination = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Monta a URL pública
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $baseDir = dirname($_SERVER['SCRIPT_NAME']);
    $fileUrl = $protocol . '://' . $host . $baseDir . '/uploads/' . $filename;

    echo json_encode(['file_url' => $fileUrl]);
} else {
    echo json_encode(['error' => 'Erro ao salvar o arquivo']);
}