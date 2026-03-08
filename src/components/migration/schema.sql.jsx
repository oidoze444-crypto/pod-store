-- ============================================================
-- SCHEMA SQL COMPLETO — POD STORE
-- Execute este arquivo no seu MySQL (Hostinger)
-- ============================================================

CREATE TABLE IF NOT EXISTS `flavors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `image_url` VARCHAR(500),
  `category` VARCHAR(255),
  `stock` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `low_stock_threshold` INT NOT NULL DEFAULT 5,
  `flavor_ids` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(500),
  `image_url` VARCHAR(500),
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50),
  `address` JSON,
  `items` JSON,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending','confirmed','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `created_by` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `store_name` VARCHAR(255) DEFAULT 'POD Store',
  `logo_url` VARCHAR(500),
  `whatsapp_number` VARCHAR(50),
  `primary_color` VARCHAR(20) DEFAULT '#059669',
  `button_color` VARCHAR(20) DEFAULT '#059669',
  `background_color` VARCHAR(20) DEFAULT '#f9fafb',
  `header_text` VARCHAR(500) DEFAULT 'Os melhores PODs com entrega rápida!',
  `delivery_fee` DECIMAL(10,2) DEFAULT 0.00,
  `min_order_value` DECIMAL(10,2) DEFAULT 0.00,
  `opening_time` VARCHAR(5) DEFAULT '08:00',
  `closing_time` VARCHAR(5) DEFAULT '22:00',
  `is_open_override` TINYINT(1) DEFAULT 1,
  `closed_message` VARCHAR(500) DEFAULT 'Estamos fechados no momento. Volte em breve!',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserir configuração padrão
INSERT IGNORE INTO `site_settings` (`id`, `store_name`) VALUES (1, 'POD Store');