#!/bin/bash
# ============================================================
# 金濠客 POS — 生產部署腳本
# ============================================================
set -e

echo "================================"
echo "  🍱 金濠客食堂 POS 系統"
echo "  生產部署腳本"
echo "================================"
echo ""

# 環境檢查
if [ -z "$PORT" ]; then
    export PORT=3100
    echo "⚠️  未設定 PORT，使用預設值：$PORT"
fi

if [ -z "$DB_PATH" ]; then
    export DB_PATH="./data/jinhaoker.db"
    echo "⚠️  未設定 DB_PATH，使用預設值：$DB_PATH"
fi

# 建立資料夾
mkdir -p data
mkdir -p logs

# 檢查 Node 版本
if ! command -v node &> /dev/null; then
    echo "❌ 請先安裝 Node.js (v18+)"
    exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
    echo "❌ Node.js 版本需 >= 18，目前為 $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v)"

# 安裝依賴（如果 node_modules 不存在）
if [ ! -d "node_modules" ]; then
    echo "📦 安裝依賴..."
    npm ci --silent
fi

# 初始化資料庫（如果還不存在）
if [ ! -f "$DB_PATH" ]; then
    echo "🗃️  初始化資料庫..."
    npm run db:init
fi

# 取得當前都在哪個 folder
CURRENT_DIR=$(pwd)

# 檢查是否已經 build
if [ ! -d ".next" ]; then
    echo "🔨 建立產程包..."
    npm run build
fi

# 啟動服務
echo ""
echo "🚀 啟動服務..."
echo "   Port: $PORT"
echo "   DB:   $DB_PATH"
echo ""

# 後台執行（可選擇用 systemd 或 PM2 管理）
if command -v pm2 &> /dev/null; then
    echo "💡 使用 PM2 管理進程"
    pm2 delete jinhaoker-pos 2>/dev/null || true
    pm2 start npm --name "jinhaoker-pos" -- start
    pm2 save
    echo "✅ 已透過 PM2 啟動"
else
    echo "⚠️  未找到 PM2，直接終端機模式啟動"
    echo "   建議安裝 PM2：npm install -g pm2"
    echo ""
    echo "   按 Ctrl+C 停止服務"
    npm start
fi

echo ""
echo "================================"
echo "  ✅ 部署完成！"
echo ""
echo "  🌐 前台：http://localhost:$PORT"
echo "  🖥️  後台：http://localhost:$PORT/admin/dashboard"
echo "  🔧 API:  http://localhost:$PORT/api/health"
echo ""
echo "  若需公開存取，請設定防火牆：sudo ufw allow $PORT"
echo "================================"