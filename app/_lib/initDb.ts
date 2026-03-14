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
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✅ Table: users");
  
  await conn.query(`
  CREATE TABLE IF NOT EXISTS staff (
    id         CHAR(36)   PRIMARY KEY,
    full_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    admin_id   CHAR(36)   NOT NULL,
    shift_role ENUM('staff') DEFAULT 'staff',
    status     ENUM('active','inactive') DEFAULT 'active',
    last_login TIMESTAMP  NULL DEFAULT NULL,
    created_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log("✅ Table: staff");
  
  await conn.query(`
    CREATE TABLE IF NOT EXISTS products (
      id         CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
      name       VARCHAR(150)  NOT NULL,
      category   VARCHAR(80),
      price      DECIMAL(10,2) NOT NULL,
      stock      INT           DEFAULT 0,
      sku        VARCHAR(50)   UNIQUE,
      emoji      VARCHAR(10),
      created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✅ Table: products");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS sales (
      id         CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
      staff_id   CHAR(36),
      total      DECIMAL(10,2) NOT NULL,
      tax        DECIMAL(10,2) DEFAULT 0,
      method     ENUM('card','cash','mobile') DEFAULT 'card',
      status     ENUM('completed','pending','refunded') DEFAULT 'completed',
      created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  console.log("✅ Table: sales");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id         CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
      sale_id    CHAR(36)      NOT NULL,
      product_id CHAR(36)      NOT NULL,
      quantity   INT           NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (sale_id)    REFERENCES sales(id)    ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);
  console.log("✅ Table: sale_items");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id         CHAR(36)  PRIMARY KEY,
      points     INT       DEFAULT 0,
      tier       ENUM('bronze','silver','gold','platinum') DEFAULT 'bronze',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("✅ Table: customers");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS staff (
      id         CHAR(36)  PRIMARY KEY,
      store_name VARCHAR(100),
      shift_role ENUM('cashier','supervisor','manager') DEFAULT 'cashier',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("✅ Table: staff");

  // Settings table with single-row constraint for global store configuration

await conn.query(`
  CREATE TABLE IF NOT EXISTS settings (
    id              INT          PRIMARY KEY DEFAULT 1,
    store_name      VARCHAR(100) DEFAULT 'POStore',
    domain          VARCHAR(100) DEFAULT 'postore',
    email           VARCHAR(150) DEFAULT 'admin@postore.app',
    phone           VARCHAR(50)  DEFAULT '',
    address         VARCHAR(255) DEFAULT '',
    currency        VARCHAR(10)  DEFAULT 'KES',
    timezone        VARCHAR(60)  DEFAULT 'Africa/Nairobi',
    tax_enabled     TINYINT(1)   DEFAULT 1,
    tax_rate        DECIMAL(5,2) DEFAULT 16.00,
    tax_name        VARCHAR(20)  DEFAULT 'VAT',
    tax_inclusive   TINYINT(1)   DEFAULT 0,
    receipt_footer  TEXT,
    notif_new_order    TINYINT(1) DEFAULT 1,
    notif_low_stock    TINYINT(1) DEFAULT 1,
    notif_daily_report TINYINT(1) DEFAULT 0,
    notif_staff_login  TINYINT(1) DEFAULT 0,
    notif_email     VARCHAR(255) DEFAULT 'admin@postore.app',
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
  )
`);
console.log("✅ Table: settings");

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
