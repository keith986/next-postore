import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export async function initDb(): Promise<void> {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || "localhost",
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
  });

  console.log("🔌 Connected to MySQL server...");

  const dbName = process.env.DB_NAME || "pos_db";

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await conn.query(`USE \`${dbName}\``);
  console.log(`✅ Database '${dbName}' ready`);

  // ── TABLES ──────────────────────────────────────────

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
      full_name  VARCHAR(100) NOT NULL,
      email      VARCHAR(150) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      role       ENUM('admin','staff','client') DEFAULT 'client',
      store_name VARCHAR(100),
      domain     VARCHAR(100) UNIQUE,
      pos_type   ENUM('retail','restaurant','salon','wholesale','pharmacy') NULL DEFAULT NULL,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✅ Table: users");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS staff (
      id         CHAR(36)     PRIMARY KEY,
      full_name  VARCHAR(100) NOT NULL,
      email      VARCHAR(150) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      admin_id   CHAR(36)     NOT NULL,
      shift_role ENUM('staff') DEFAULT 'staff',
      status     ENUM('active','inactive') DEFAULT 'active',
      last_login TIMESTAMP    NULL DEFAULT NULL,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_admin_id (admin_id)
    )
  `);
  console.log("✅ Table: staff");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS products (
      id          VARCHAR(36)   NOT NULL PRIMARY KEY,
      name        VARCHAR(255)  NOT NULL,
      category    VARCHAR(100)  NOT NULL,
      price       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      stock       INT           NOT NULL DEFAULT 0,
      sku         VARCHAR(100)  NULL,
      description TEXT          NULL,
      status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
      admin_id    VARCHAR(36)   NOT NULL,
      created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_admin_id (admin_id),
      INDEX idx_category (category),
      INDEX idx_status   (status)
    )
  `);
  console.log("✅ Table: products");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id          VARCHAR(36)  NOT NULL PRIMARY KEY,
      product_id  VARCHAR(36)  NOT NULL,
      type        ENUM('restock','adjustment','sale','return') NOT NULL,
      quantity    INT          NOT NULL,
      note        TEXT         NULL,
      admin_id    VARCHAR(36)  NOT NULL,
      created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_product_id (product_id),
      INDEX idx_admin_id   (admin_id),
      INDEX idx_created_at (created_at)
    )
  `);
  console.log("✅ Table: stock_movements");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id             VARCHAR(36)   NOT NULL PRIMARY KEY,
      full_name      VARCHAR(255)  NOT NULL,
      email          VARCHAR(255)  NOT NULL,
      phone          VARCHAR(50)   NULL,
      status         ENUM('active','inactive') NOT NULL DEFAULT 'active',
      total_orders   INT           NOT NULL DEFAULT 0,
      total_spent    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      loyalty_points INT           NOT NULL DEFAULT 0,
      admin_id       VARCHAR(36)   NOT NULL,
      last_order     TIMESTAMP     NULL,
      created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_admin_id (admin_id),
      INDEX idx_email    (email),
      INDEX idx_status   (status)
    )
  `);
  console.log("✅ Table: customers");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id             VARCHAR(36)   NOT NULL PRIMARY KEY,
      order_number   VARCHAR(50)   NOT NULL UNIQUE,
      customer_id    VARCHAR(36)   NULL,
      customer_name  VARCHAR(255)  NOT NULL,
      customer_email VARCHAR(255)  NOT NULL DEFAULT '',
      items          JSON          NOT NULL,
      subtotal       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      tax            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      total          DECIMAL(12,2) NOT NULL,
      status         ENUM('pending','processing','completed','refunded','cancelled') NOT NULL DEFAULT 'pending',
      payment_method ENUM('card','cash','mobile') NOT NULL DEFAULT 'cash',
      payment_status ENUM('paid','pending','refunded') NOT NULL DEFAULT 'paid',
      staff_name     VARCHAR(255)  NULL,
      note           TEXT          NULL,
      admin_id       VARCHAR(36)   NOT NULL,
      created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_admin_id    (admin_id),
      INDEX idx_status      (status),
      INDEX idx_customer_id (customer_id),
      INDEX idx_created_at  (created_at)
    )
  `);
  console.log("✅ Table: orders");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id                 INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
      admin_id           CHAR(36)     NOT NULL UNIQUE,
      store_name         VARCHAR(100) DEFAULT 'POStore',
      domain             VARCHAR(100) DEFAULT 'postore',
      email              VARCHAR(150) DEFAULT '',
      phone              VARCHAR(50)  DEFAULT '',
      address            VARCHAR(255) DEFAULT '',
      currency           VARCHAR(10)  DEFAULT 'KES',
      timezone           VARCHAR(60)  DEFAULT 'Africa/Nairobi',
      tax_enabled        TINYINT(1)   DEFAULT 1,
      tax_rate           DECIMAL(5,2) DEFAULT 16.00,
      tax_name           VARCHAR(20)  DEFAULT 'VAT',
      tax_inclusive      TINYINT(1)   DEFAULT 0,
      receipt_footer     TEXT,
      notif_new_order    TINYINT(1)   DEFAULT 1,
      notif_low_stock    TINYINT(1)   DEFAULT 1,
      notif_daily_report TINYINT(1)   DEFAULT 0,
      notif_staff_login  TINYINT(1)   DEFAULT 0,
      notif_email        VARCHAR(255) DEFAULT '',
      updated_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log("✅ Table: settings");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS tables (
  id                VARCHAR(36)  NOT NULL PRIMARY KEY,
  table_number      INT          NOT NULL,
  label             VARCHAR(100) NOT NULL,
  capacity          INT          NOT NULL DEFAULT 4,
  status            ENUM('available','occupied','reserved','cleaning') NOT NULL DEFAULT 'available',
  section           VARCHAR(100) NOT NULL DEFAULT 'Main',
  current_order_id  VARCHAR(36)  NULL DEFAULT NULL,
  admin_id          VARCHAR(36)  NOT NULL,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 
  INDEX idx_admin_id (admin_id),
  INDEX idx_status   (status),
  INDEX idx_section  (section)
);
`);
console.log("✅ Table: tables");

await conn.query(`
  CREATE TABLE IF NOT EXISTS menu_items (
  id           VARCHAR(36)   NOT NULL PRIMARY KEY,
  name         VARCHAR(255)  NOT NULL,
  description  TEXT          NULL,
  category     VARCHAR(100)  NOT NULL DEFAULT 'Other',
  price        DECIMAL(10,2) NOT NULL,
  cost         DECIMAL(10,2) NULL,
  calories     INT           NULL,
  prep_time    INT           NULL,          -- minutes
  is_available TINYINT(1)    NOT NULL DEFAULT 1,
  is_featured  TINYINT(1)    NOT NULL DEFAULT 0,
  tags         JSON          NULL,          -- ["Vegan","Spicy",...]
  admin_id     VARCHAR(36)   NOT NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 
  INDEX idx_admin_id    (admin_id),
  INDEX idx_category    (category),
  INDEX idx_available   (is_available),
  INDEX idx_featured    (is_featured)
)
`);
console.log('✅ Table: menu_items')

  // ── SEED DEFAULT ADMIN ───────────────────────────────

  const [rows] = await conn.query(
    "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
  );

  const existing = rows as { id: string }[];

  if (existing.length === 0) {
    const hashed = await bcrypt.hash("admin123", 10);
    await conn.query(
      `INSERT INTO users (full_name, email, password, role, store_name, domain)
       VALUES (?, ?, ?, 'admin', ?, ?)`,
      ["Super Admin", "admin@postore.app", hashed, "POStore", "postore"]
    );
    console.log("🌱 Default admin seeded → email: admin@postore.app | password: admin123");
  }

  await conn.end();
  console.log("🎉 Database initialization complete!\n");
}