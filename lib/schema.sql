-- ============================================================
-- 金濠客食堂 POS 系統 — Schema
-- ============================================================

PRAGMA foreign_keys = ON;

-- 供應商
CREATE TABLE IF NOT EXISTS supplier (
    supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', '+8 hours')),
    updated_at TEXT DEFAULT (datetime('now', '+8 hours'))
);

-- 食材（原材料）
CREATE TABLE IF NOT EXISTS ingredient (
    ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    unit TEXT DEFAULT 'kg',
    stock_qty REAL DEFAULT 0,
    low_stock_threshold REAL DEFAULT 5,
    supplier_id INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', '+8 hours')),
    updated_at TEXT DEFAULT (datetime('now', '+8 hours')),
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
);

-- 菜單品項
CREATE TABLE IF NOT EXISTS menu_item (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', '+8 hours')),
    updated_at TEXT DEFAULT (datetime('now', '+8 hours'))
);

-- 食譜（餐點的原料組成）
CREATE TABLE IF NOT EXISTS recipe (
    item_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    consume_qty REAL NOT NULL DEFAULT 0,
    PRIMARY KEY (item_id, ingredient_id),
    FOREIGN KEY (item_id) REFERENCES menu_item(item_id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id)
);

-- 訂單（order 是 SQL 保留字，需用雙引號）
CREATE TABLE IF NOT EXISTS "order" (
    order_id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    note TEXT,
    total_amount INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now', '+8 hours')),
    updated_at TEXT DEFAULT (datetime('now', '+8 hours'))
);

-- 訂單明細
CREATE TABLE IF NOT EXISTS order_item (
    order_id TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal INTEGER NOT NULL,
    PRIMARY KEY (order_id, item_id),
    FOREIGN KEY (order_id) REFERENCES "order"(order_id),
    FOREIGN KEY (item_id) REFERENCES menu_item(item_id)
);

-- 採購單
CREATE TABLE IF NOT EXISTS purchase_order (
    po_id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER,
    total_amount INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    expected_date TEXT,
    created_at TEXT DEFAULT (datetime('now', '+8 hours')),
    updated_at TEXT DEFAULT (datetime('now', '+8 hours')),
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
);

-- 採購單明細
CREATE TABLE IF NOT EXISTS purchase_order_item (
    po_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    ordered_qty REAL NOT NULL,
    unit_cost REAL DEFAULT 0,
    received_qty REAL DEFAULT 0,
    is_qualified INTEGER DEFAULT 1,
    reject_reason TEXT,
    PRIMARY KEY (po_id, ingredient_id),
    FOREIGN KEY (po_id) REFERENCES purchase_order(po_id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id)
);

-- ============================================================
-- Indexes（加速常見查詢）
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_order_status ON "order"(status);
CREATE INDEX IF NOT EXISTS idx_order_date ON "order"(created_at);
CREATE INDEX IF NOT EXISTS idx_menu_active ON menu_item(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_item(category);
CREATE INDEX IF NOT EXISTS idx_ingredient_active ON ingredient(is_active);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_order(status);