-- ============================================================
--  LUXE E-Commerce  –  MySQL Schema
--  Run once:  mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS luxe_store
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE luxe_store;

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT UNSIGNED      AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120)      NOT NULL,
  email        VARCHAR(180)      NOT NULL UNIQUE,
  password     VARCHAR(255)      NOT NULL,          -- bcrypt hash
  role         ENUM('customer','admin') DEFAULT 'customer',
  created_at   DATETIME          DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME          DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── ADDRESSES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id           INT UNSIGNED      AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED      NOT NULL,
  first_name   VARCHAR(80)       NOT NULL,
  last_name    VARCHAR(80)       NOT NULL,
  address_line VARCHAR(255)      NOT NULL,
  city         VARCHAR(100)      NOT NULL,
  postal_code  VARCHAR(20)       NOT NULL,
  country      VARCHAR(80)       NOT NULL,
  is_default   TINYINT(1)        DEFAULT 0,
  created_at   DATETIME          DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id           INT UNSIGNED      AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(80)       NOT NULL UNIQUE,
  emoji        VARCHAR(10)       DEFAULT '🛍️',
  created_at   DATETIME          DEFAULT CURRENT_TIMESTAMP
);

-- ─── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  category_id    INT UNSIGNED    NOT NULL,
  name           VARCHAR(200)    NOT NULL,
  description    TEXT,
  price          DECIMAL(10,2)   NOT NULL,
  original_price DECIMAL(10,2)   DEFAULT NULL,
  emoji          VARCHAR(10)     DEFAULT '🛍️',
  badge          VARCHAR(40)     DEFAULT NULL,      -- 'New', 'Sale', etc.
  stock          INT UNSIGNED    DEFAULT 100,
  rating         DECIMAL(3,2)    DEFAULT 0.00,
  review_count   INT UNSIGNED    DEFAULT 0,
  is_active      TINYINT(1)      DEFAULT 1,
  created_at     DATETIME        DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ─── PRODUCT SIZES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_sizes (
  id           INT UNSIGNED      AUTO_INCREMENT PRIMARY KEY,
  product_id   INT UNSIGNED      NOT NULL,
  size_label   VARCHAR(20)       NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── CART ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id           INT UNSIGNED      AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED      NOT NULL,
  product_id   INT UNSIGNED      NOT NULL,
  size         VARCHAR(20)       DEFAULT NULL,
  quantity     INT UNSIGNED      DEFAULT 1,
  added_at     DATETIME          DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart (user_id, product_id, size),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── ORDERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id             INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  order_number   VARCHAR(20)     NOT NULL UNIQUE,   -- e.g. LX-12345
  user_id        INT UNSIGNED    NOT NULL,
  address_id     INT UNSIGNED    DEFAULT NULL,
  subtotal       DECIMAL(10,2)   NOT NULL,
  shipping       DECIMAL(10,2)   DEFAULT 0.00,
  tax            DECIMAL(10,2)   DEFAULT 0.00,
  total          DECIMAL(10,2)   NOT NULL,
  status         ENUM(
                   'pending','confirmed','processing',
                   'shipped','delivered','cancelled','refunded'
                 ) DEFAULT 'pending',
  created_at     DATETIME        DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id),
  FOREIGN KEY (address_id) REFERENCES addresses(id)
);

-- ─── ORDER ITEMS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           INT UNSIGNED      AUTO_INCREMENT PRIMARY KEY,
  order_id     INT UNSIGNED      NOT NULL,
  product_id   INT UNSIGNED      NOT NULL,
  product_name VARCHAR(200)      NOT NULL,           -- snapshot at purchase
  price        DECIMAL(10,2)     NOT NULL,           -- snapshot at purchase
  size         VARCHAR(20)       DEFAULT NULL,
  quantity     INT UNSIGNED      NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ─── PAYMENT DETAILS ─────────────────────────────────────────
-- NEVER store raw card numbers.  Store only safe metadata.
CREATE TABLE IF NOT EXISTS payment_details (
  id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  order_id        INT UNSIGNED  NOT NULL UNIQUE,
  payment_method  VARCHAR(40)   NOT NULL,            -- 'card', 'paypal', etc.
  card_last4      CHAR(4)       DEFAULT NULL,        -- last 4 digits only
  card_brand      VARCHAR(20)   DEFAULT NULL,        -- 'Visa', 'Mastercard'
  transaction_id  VARCHAR(120)  DEFAULT NULL,        -- from payment gateway
  status          ENUM('pending','success','failed','refunded') DEFAULT 'pending',
  paid_at         DATETIME      DEFAULT NULL,
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ─── WISHLIST ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id           INT UNSIGNED      AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED      NOT NULL,
  product_id   INT UNSIGNED      NOT NULL,
  added_at     DATETIME          DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wish (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── SEED DATA ───────────────────────────────────────────────
INSERT IGNORE INTO categories (name, emoji) VALUES
  ('Clothing',    '👗'),
  ('Accessories', '👜'),
  ('Home',        '🛋️'),
  ('Beauty',      '✨'),
  ('Footwear',    '👠');

INSERT IGNORE INTO products
  (category_id, name, description, price, original_price, emoji, badge) VALUES
  (1, 'Linen Wrap Dress',    'Breezy 100% European linen wrap dress.',    89,  120, '👗', 'Sale'),
  (2, 'Leather Tote Bag',    'Hand-stitched full-grain leather tote.',    185, NULL,'👜', NULL),
  (3, 'Ceramic Candle Set',  'Trio of hand-poured soy wax candles.',      48,  NULL,'🕯️','New'),
  (2, 'Gold Hoop Earrings',  '14K gold-filled oversized hoops.',          65,  85,  '💍','Sale'),
  (1, 'Merino Wool Sweater', '100% merino wool crew neck sweater.',       145, NULL,'🧥', NULL),
  (5, 'Block-Heel Mules',    'Minimalist leather mules, 6cm block heel.', 125, 160, '👠','Sale'),
  (4, 'Rose Face Serum',     'Rose hip & hyaluronic acid serum, 30ml.',   58,  NULL,'🌹','New'),
  (3, 'Woven Rattan Basket', 'Hand-woven natural rattan storage basket.', 72,  NULL,'🧺', NULL),
  (2, 'Silk Scarf',          '100% mulberry silk scarf, 90cm × 90cm.',   95,  NULL,'🧣','New'),
  (1, 'Wide-Leg Trousers',   'High-waisted wide-leg crepe trousers.',     110, 135, '👖','Sale');

INSERT IGNORE INTO product_sizes (product_id, size_label) VALUES
  (1,'XS'),(1,'S'),(1,'M'),(1,'L'),(1,'XL'),
  (4,'30mm'),(4,'40mm'),(4,'50mm'),
  (5,'XS'),(5,'S'),(5,'M'),(5,'L'),(5,'XL'),(5,'XXL'),
  (6,'36'),(6,'37'),(6,'38'),(6,'39'),(6,'40'),(6,'41'),
  (10,'XS'),(10,'S'),(10,'M'),(10,'L'),(10,'XL');
