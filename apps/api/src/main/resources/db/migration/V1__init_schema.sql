SET NAMES utf8mb4;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_code VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED',
  category VARCHAR(64),
  planting_month VARCHAR(32),
  suitable_region VARCHAR(32),
  image_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE inventory_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL UNIQUE,
  online_stock INT NOT NULL DEFAULT 0,
  warning_threshold INT NOT NULL DEFAULT 5,
  version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(64) NOT NULL UNIQUE,
  buyer_id BIGINT NOT NULL,
  status VARCHAR(32) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_buyer FOREIGN KEY (buyer_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  product_name_snapshot VARCHAR(128) NOT NULL,
  price_snapshot DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE inventory_inbound_entries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  note VARCHAR(255),
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inbound_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_inbound_user FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE inventory_movements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  type VARCHAR(32) NOT NULL,
  quantity INT NOT NULL,
  source_ref_type VARCHAR(32),
  source_ref_id VARCHAR(64),
  operator_user_id BIGINT,
  remark VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_movement_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE announcements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMP NULL,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_announcement_user FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE promotions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  strategy_type VARCHAR(32) NOT NULL,
  description TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_promotion_user FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE promotion_posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  promotion_id BIGINT NOT NULL,
  channel VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  image_url MEDIUMTEXT,
  post_status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMP NULL,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id),
  CONSTRAINT fk_post_user FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE sales_daily_summary (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  biz_date DATE NOT NULL UNIQUE,
  orders_count INT NOT NULL,
  units_sold INT NOT NULL,
  gross_sales DECIMAL(10,2) NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password_hash, role_code) VALUES
('buyer', '$2a$10$2L90JvMNP95B2S/bR5CV6u9R8stA79Q4iiY77xY7Mpx0bpBfqt4DG', 'BUYER'),
('admin', '$2a$10$2L90JvMNP95B2S/bR5CV6u9R8stA79Q4iiY77xY7Mpx0bpBfqt4DG', 'ADMIN'),
('stockadmin', '$2a$10$2L90JvMNP95B2S/bR5CV6u9R8stA79Q4iiY77xY7Mpx0bpBfqt4DG', 'INVENTORY_MANAGER');

INSERT INTO products (sku, name, description, price, status, category) VALUES
('SEED-TOMATO-001', '番茄种子', '适合阳台种植，发芽稳定，适合新手入门。', 9.90, 'PUBLISHED', '蔬菜种子'),
('SEED-BASIL-001', '罗勒种子', '适合厨房窗台种植，香味浓郁，适合日常采摘。', 12.50, 'PUBLISHED', '草本植物');

INSERT INTO inventory_items (product_id, online_stock, warning_threshold) VALUES
(1, 100, 15),
(2, 80, 10);
