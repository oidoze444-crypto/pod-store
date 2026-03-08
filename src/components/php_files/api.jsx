<?php
// api.php - API principal (substitui todas as funções backend do Base44)
require_once 'config.php';
setCorsHeaders();

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) {
    echo json_encode(['error' => 'Body inválido']);
    exit();
}

$entity = $body['entity'] ?? '';
$action = $body['action'] ?? '';
$data   = $body['data'] ?? [];
$id     = $body['id'] ?? null;
$filters = $body['filters'] ?? [];
$sort   = $body['sort'] ?? null;
$limit  = $body['limit'] ?? null;

$conn = getConnection();

// ============================================================
// PRODUCTS
// ============================================================
if ($entity === 'products') {

    if ($action === 'list') {
        $where = [];
        if (isset($filters['is_active'])) $where[] = "is_active = " . ($filters['is_active'] ? 1 : 0);
        if (isset($filters['is_featured'])) $where[] = "is_featured = " . ($filters['is_featured'] ? 1 : 0);
        $q = "SELECT * FROM products" . (count($where) ? " WHERE " . implode(" AND ", $where) : "");
        $q .= " ORDER BY " . ($sort ?: "created_at") . " DESC";
        if ($limit) $q .= " LIMIT " . intval($limit);
        $result = $conn->query($q);
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $row['flavor_ids'] = json_decode($row['flavor_ids'] ?? '[]', true);
            $row['is_active'] = (bool)$row['is_active'];
            $row['is_featured'] = (bool)$row['is_featured'];
            $rows[] = $row;
        }
        echo json_encode($rows);

    } elseif ($action === 'get') {
        $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        if ($row) {
            $row['flavor_ids'] = json_decode($row['flavor_ids'] ?? '[]', true);
            $row['is_active'] = (bool)$row['is_active'];
            $row['is_featured'] = (bool)$row['is_featured'];
        }
        echo json_encode($row);

    } elseif ($action === 'create') {
        $name = $data['name'] ?? '';
        $desc = $data['description'] ?? null;
        $price = floatval($data['price'] ?? 0);
        $image_url = $data['image_url'] ?? null;
        $category = $data['category'] ?? null;
        $stock = intval($data['stock'] ?? 0);
        $is_active = isset($data['is_active']) && $data['is_active'] !== false ? 1 : 0;
        $is_featured = !empty($data['is_featured']) ? 1 : 0;
        $low_stock = intval($data['low_stock_threshold'] ?? 5);
        $flavor_ids = json_encode($data['flavor_ids'] ?? []);
        $stmt = $conn->prepare("INSERT INTO products (name, description, price, image_url, category, stock, is_active, is_featured, low_stock_threshold, flavor_ids) VALUES (?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("ssdssiiis", $name, $desc, $price, $image_url, $category, $stock, $is_active, $is_featured, $low_stock, $flavor_ids);

        // fix: bind_param needs variables (reuse $flavor_ids already set)
        $stmt = $conn->prepare("INSERT INTO products (name, description, price, image_url, category, stock, is_active, is_featured, low_stock_threshold, flavor_ids) VALUES (?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("ssdssiiiis", $name, $desc, $price, $image_url, $category, $stock, $is_active, $is_featured, $low_stock, $flavor_ids);
        $stmt->execute();
        $newId = $conn->insert_id;
        $stmt2 = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $stmt2->bind_param("i", $newId);
        $stmt2->execute();
        $row = $stmt2->get_result()->fetch_assoc();
        $row['flavor_ids'] = json_decode($row['flavor_ids'] ?? '[]', true);
        $row['is_active'] = (bool)$row['is_active'];
        $row['is_featured'] = (bool)$row['is_featured'];
        echo json_encode($row);

    } elseif ($action === 'update') {
        $allowed = ['name','description','price','image_url','category','stock','is_active','is_featured','low_stock_threshold','flavor_ids'];
        $fields = []; $vals = []; $types = '';
        foreach ($allowed as $k) {
            if (array_key_exists($k, $data)) {
                $fields[] = "$k = ?";
                if ($k === 'flavor_ids') { $vals[] = json_encode($data[$k]); $types .= 's'; }
                elseif ($k === 'is_active' || $k === 'is_featured') { $vals[] = $data[$k] ? 1 : 0; $types .= 'i'; }
                elseif ($k === 'price') { $vals[] = floatval($data[$k]); $types .= 'd'; }
                elseif (in_array($k, ['stock','low_stock_threshold'])) { $vals[] = intval($data[$k]); $types .= 'i'; }
                else { $vals[] = $data[$k]; $types .= 's'; }
            }
        }
        $vals[] = $id; $types .= 'i';
        $stmt = $conn->prepare("UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->bind_param($types, ...$vals);
        $stmt->execute();
        $stmt2 = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $stmt2->bind_param("i", $id);
        $stmt2->execute();
        $row = $stmt2->get_result()->fetch_assoc();
        $row['flavor_ids'] = json_decode($row['flavor_ids'] ?? '[]', true);
        $row['is_active'] = (bool)$row['is_active'];
        $row['is_featured'] = (bool)$row['is_featured'];
        echo json_encode($row);

    } elseif ($action === 'delete') {
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
    }

// ============================================================
// FLAVORS
// ============================================================
} elseif ($entity === 'flavors') {

    if ($action === 'list') {
        $q = "SELECT * FROM flavors";
        if (isset($filters['is_active'])) $q .= " WHERE is_active = " . ($filters['is_active'] ? 1 : 0);
        $q .= " ORDER BY name ASC";
        $result = $conn->query($q);
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $row['is_active'] = (bool)$row['is_active'];
            $rows[] = $row;
        }
        echo json_encode($rows);

    } elseif ($action === 'create') {
        $name = $data['name'];
        $is_active = isset($data['is_active']) && $data['is_active'] !== false ? 1 : 0;
        $stmt = $conn->prepare("INSERT INTO flavors (name, is_active) VALUES (?,?)");
        $stmt->bind_param("si", $name, $is_active);
        $stmt->execute();
        $newId = $conn->insert_id;
        $stmt2 = $conn->prepare("SELECT * FROM flavors WHERE id = ?");
        $stmt2->bind_param("i", $newId);
        $stmt2->execute();
        $row = $stmt2->get_result()->fetch_assoc();
        $row['is_active'] = (bool)$row['is_active'];
        echo json_encode($row);

    } elseif ($action === 'update') {
        $fields = []; $vals = []; $types = '';
        if (isset($data['name'])) { $fields[] = "name = ?"; $vals[] = $data['name']; $types .= 's'; }
        if (isset($data['is_active'])) { $fields[] = "is_active = ?"; $vals[] = $data['is_active'] ? 1 : 0; $types .= 'i'; }
        $vals[] = $id; $types .= 'i';
        $stmt = $conn->prepare("UPDATE flavors SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->bind_param($types, ...$vals);
        $stmt->execute();
        $stmt2 = $conn->prepare("SELECT * FROM flavors WHERE id = ?");
        $stmt2->bind_param("i", $id);
        $stmt2->execute();
        $row = $stmt2->get_result()->fetch_assoc();
        $row['is_active'] = (bool)$row['is_active'];
        echo json_encode($row);

    } elseif ($action === 'delete') {
        $stmt = $conn->prepare("DELETE FROM flavors WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
    }

// ============================================================
// BANNERS
// ============================================================
} elseif ($entity === 'banners') {

    if ($action === 'list') {
        $q = "SELECT * FROM banners";
        if (isset($filters['is_active'])) $q .= " WHERE is_active = " . ($filters['is_active'] ? 1 : 0);
        $q .= " ORDER BY `order` ASC";
        $result = $conn->query($q);
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $row['is_active'] = (bool)$row['is_active'];
            $rows[] = $row;
        }
        echo json_encode($rows);

    } elseif ($action === 'create') {
        $title = $data['title'];
        $subtitle = $data['subtitle'] ?? null;
        $image_url = $data['image_url'] ?? null;
        $is_active = isset($data['is_active']) && $data['is_active'] !== false ? 1 : 0;
        $order = intval($data['order'] ?? 0);
        $stmt = $conn->prepare("INSERT INTO banners (title, subtitle, image_url, is_active, `order`) VALUES (?,?,?,?,?)");
        $stmt->bind_param("sssii", $title, $subtitle, $image_url, $is_active, $order);
        $stmt->execute();
        $newId = $conn->insert_id;
        $stmt2 = $conn->prepare("SELECT * FROM banners WHERE id = ?");
        $stmt2->bind_param("i", $newId);
        $stmt2->execute();
        $row = $stmt2->get_result()->fetch_assoc();
        $row['is_active'] = (bool)$row['is_active'];
        echo json_encode($row);

    } elseif ($action === 'update') {
        $allowed = ['title','subtitle','image_url','is_active','order'];
        $fields = []; $vals = []; $types = '';
        foreach ($allowed as $k) {
            if (array_key_exists($k, $data)) {
                $fields[] = ($k === 'order' ? '`order`' : $k) . " = ?";
                if ($k === 'is_active') { $vals[] = $data[$k] ? 1 : 0; $types .= 'i'; }
                elseif ($k === 'order') { $vals[] = intval($data[$k]); $types .= 'i'; }
                else { $vals[] = $data[$k]; $types .= 's'; }
            }
        }
        $vals[] = $id; $types .= 'i';
        $stmt = $conn->prepare("UPDATE banners SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->bind_param($types, ...$vals);
        $stmt->execute();
        $stmt2 = $conn->prepare("SELECT * FROM banners WHERE id = ?");
        $stmt2->bind_param("i", $id);
        $stmt2->execute();
        $row = $stmt2->get_result()->fetch_assoc();
        $row['is_active'] = (bool)$row['is_active'];
        echo json_encode($row);

    } elseif ($action === 'delete') {
        $stmt = $conn->prepare("DELETE FROM banners WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
    }

// ============================================================
// ORDERS
// ============================================================
} elseif ($entity === 'orders') {

    if ($action === 'list') {
        $where = [];
        if (!empty($filters['status'])) $where[] = "status = '" . $conn->real_escape_string($filters['status']) . "'";
        $q = "SELECT * FROM orders" . (count($where) ? " WHERE " . implode(" AND ", $where) : "");
        $q .= " ORDER BY created_at DESC";
        if ($limit) $q .= " LIMIT " . intval($limit);
        $result = $conn->query($q);
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $row['address'] = json_decode($row['address'] ?? '{}', true);
            $row['items'] = json_decode($row['items'] ?? '[]', true);
            $rows[] = $row;
        }
        echo json_encode($rows);

    } elseif ($action === 'get') {
        $stmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        if ($row) {
            $row['address'] = json_decode($row['address'] ?? '{}', true);
            $row['items'] = json_decode($row['items'] ?? '[]', true);
        }
        echo json_encode($row);

    } elseif ($action === 'create') {
        $customer_name = $data['customer_name'] ?? '';
        $customer_phone = $data['customer_phone'] ?? null;
        $address = json_encode($data['address'] ?? []);
        $items = json_encode($data['items'] ?? []);
        $subtotal = floatval($data['subtotal'] ?? 0);
        $delivery_fee = floatval($data['delivery_fee'] ?? 0);
        $total = floatval($data['total'] ?? 0);
        $status = $data['status'] ?? 'pending';
        $stmt = $conn->prepare("INSERT INTO orders (customer_name, customer_phone, address, items, subtotal, delivery_fee, total, status) VALUES (?,?,?,?,?,?,?,?)");
        $stmt->bind_param("ssssddds", $customer_name, $customer_phone, $address, $items, $subtotal, $delivery_fee, $total, $status);
        $stmt->execute();
        $newId = $conn->insert_id;
        $stmt2 = $conn->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt2->bind_param("i", $newId);
        $stmt2->execute();
        $row = $stmt2->get_result()->fetch_assoc();
        $row['address'] = json_decode($row['address'] ?? '{}', true);
        $row['items'] = json_decode($row['items'] ?? '[]', true);
        echo json_encode($row);

    } elseif ($action === 'update') {
        $allowed = ['customer_name','customer_phone','address','items','subtotal','delivery_fee','total','status'];
        $fields = []; $vals = []; $types = '';
        foreach ($allowed as $k) {
            if (array_key_exists($k, $data)) {
                $fields[] = "$k = ?";
                if (in_array($k, ['address','items'])) { $vals[] = json_encode($data[$k]); $types .= 's'; }
                elseif (in_array($k, ['subtotal','delivery_fee','total'])) { $vals[] = floatval($data[$k]); $types .= 'd'; }
                else { $vals[] = $data[$k]; $types .= 's'; }
            }
        }
        $vals[] = $id; $types .= 'i';
        $stmt = $conn->prepare("UPDATE orders SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->bind_param($types, ...$vals);
        $stmt->execute();
        $stmt2 = $conn->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt2->bind_param("i", $id);
        $stmt2->execute();
        $row = $stmt2->get_result()->fetch_assoc();
        $row['address'] = json_decode($row['address'] ?? '{}', true);
        $row['items'] = json_decode($row['items'] ?? '[]', true);
        echo json_encode($row);

    } elseif ($action === 'delete') {
        $stmt = $conn->prepare("DELETE FROM orders WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
    }

// ============================================================
// SITE SETTINGS
// ============================================================
} elseif ($entity === 'site_settings') {

    if ($action === 'list' || $action === 'get') {
        $result = $conn->query("SELECT * FROM site_settings LIMIT 1");
        $row = $result->fetch_assoc();
        if ($row) $row['is_open_override'] = (bool)$row['is_open_override'];
        echo json_encode($row);

    } elseif ($action === 'upsert') {
        $checkResult = $conn->query("SELECT id FROM site_settings LIMIT 1");
        $existing = $checkResult->fetch_assoc();
        $fields_list = ['store_name','logo_url','whatsapp_number','primary_color','button_color','background_color','header_text','delivery_fee','min_order_value','opening_time','closing_time','is_open_override','closed_message'];
        if ($existing) {
            $fields = []; $vals = []; $types = '';
            foreach ($fields_list as $k) {
                if (array_key_exists($k, $data)) {
                    $fields[] = "$k = ?";
                    if ($k === 'is_open_override') { $vals[] = $data[$k] ? 1 : 0; $types .= 'i'; }
                    elseif (in_array($k, ['delivery_fee','min_order_value'])) { $vals[] = floatval($data[$k]); $types .= 'd'; }
                    else { $vals[] = $data[$k]; $types .= 's'; }
                }
            }
            $vals[] = $existing['id']; $types .= 'i';
            $stmt = $conn->prepare("UPDATE site_settings SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->bind_param($types, ...$vals);
            $stmt->execute();
        } else {
            $cols = []; $vals = []; $types = '';
            foreach ($fields_list as $k) {
                if (array_key_exists($k, $data)) {
                    $cols[] = $k;
                    if ($k === 'is_open_override') { $vals[] = $data[$k] ? 1 : 0; $types .= 'i'; }
                    elseif (in_array($k, ['delivery_fee','min_order_value'])) { $vals[] = floatval($data[$k]); $types .= 'd'; }
                    else { $vals[] = $data[$k]; $types .= 's'; }
                }
            }
            $placeholders = implode(',', array_fill(0, count($cols), '?'));
            $stmt = $conn->prepare("INSERT INTO site_settings (" . implode(',', $cols) . ") VALUES ($placeholders)");
            $stmt->bind_param($types, ...$vals);
            $stmt->execute();
        }
        $result = $conn->query("SELECT * FROM site_settings LIMIT 1");
        $row = $result->fetch_assoc();
        if ($row) $row['is_open_override'] = (bool)$row['is_open_override'];
        echo json_encode($row);
    }

} else {
    echo json_encode(['error' => 'Entidade inválida']);
}

$conn->close();