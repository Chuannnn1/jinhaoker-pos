-- ============================================================
-- 金濠客食堂 POS 系統 — Database Schema
-- DB Engine: SQLite3
-- Normalization: 3NF
-- ============================================================

PRAGMA foreign_keys = ON;

-- (1) 供應商
CREATE TABLE IF NOT EXISTS supplier (
    supplier_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL UNIQUE,
    phone         TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- (2) 食材
CREATE TABLE IF NOT EXISTS ingredient (
    ingredient_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL UNIQUE,
    unit            TEXT    NOT NULL,
    stock_qty       REAL    NOT NULL DEFAULT 0,
    safety_stock    REAL    NOT NULL DEFAULT 0,
    cost_per_unit   REAL,
    supplier_id     INTEGER,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- (3) 菜單品項（餐點）
CREATE TABLE IF NOT EXISTS menu_item (
    item_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL UNIQUE,
    category      TEXT,
    price         INTEGER NOT NULL,
    description   TEXT,
    image_url     TEXT,
    is_active     INTEGER NOT NULL DEFAULT 1,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- (4) 食譜（餐點 ↔ 食材 消耗關係）
CREATE TABLE IF NOT EXISTS recipe (
    item_id         INTEGER NOT NULL,
    ingredient_id   INTEGER NOT NULL,
    consume_qty     REAL    NOT NULL,
    PRIMARY KEY (item_id, ingredient_id),
    FOREIGN KEY (item_id) REFERENCES menu_item(item_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- (5) 訂單
CREATE TABLE IF NOT EXISTS "order" (
    order_id              TEXT    PRIMARY KEY,
    order_date            TEXT    NOT NULL,
    created_at            TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at            TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    customer_name         TEXT    NOT NULL,
    customer_phone        TEXT,
    note                  TEXT,
    total_amount          INTEGER NOT NULL DEFAULT 0,
    status                TEXT    NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','cooking','delivering','completed','cancelled'))
);

-- (6) 訂單明細
CREATE TABLE IF NOT EXISTS order_item (
    order_item_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id        TEXT    NOT NULL,
    item_id         INTEGER NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    subtotal        INTEGER NOT NULL,
    customization   TEXT,
    FOREIGN KEY (order_id) REFERENCES "order"(order_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_item(item_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- (7) 採購單
CREATE TABLE IF NOT EXISTS purchase_order (
    po_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id   INTEGER NOT NULL,
    order_date    TEXT    NOT NULL,
    status        TEXT    NOT NULL DEFAULT 'ordered'
                  CHECK (status IN ('ordered','received','partial','returned')),
    total_amount  REAL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- (8) 採購單明細
CREATE TABLE IF NOT EXISTS purchase_order_item (
    po_item_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    po_id           INTEGER NOT NULL,
    ingredient_id   INTEGER NOT NULL,
    ordered_qty     REAL    NOT NULL,
    received_qty    REAL,
    unit_price      REAL    NOT NULL,
    is_qualified    INTEGER DEFAULT NULL,
    reject_reason   TEXT,
    FOREIGN KEY (po_id) REFERENCES purchase_order(po_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_order_date ON "order"(order_date);
CREATE INDEX IF NOT EXISTS idx_order_status ON "order"(status);
CREATE INDEX IF NOT EXISTS idx_ingredient_supplier ON ingredient(supplier_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_stock ON ingredient(stock_qty);
CREATE INDEX IF NOT EXISTS idx_menu_item_active ON menu_item(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_item_category ON menu_item(category);
CREATE INDEX IF NOT EXISTS idx_order_item_order ON order_item(order_id);
CREATE INDEX IF NOT EXISTS idx_po_item_po ON purchase_order_item(po_id);