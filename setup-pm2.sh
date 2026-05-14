#!/bin/bash
# ============================================================
# 金濠客 POS — 開機自啟設定（PM2 版）
# ============================================================
set -e

echo "================================"
echo "  🔧 POS 系統 PM2 開機自啟"
echo "================================"
echo ""

DEPLOY_DIR=${DEPLOY_DIR:-/opt/jinhaoker-pos}
PORT=${PORT:-3100}

# 確認 PM2 已安裝
if ! command -v pm2 &> /dev/null; then
    echo "📦 安裝 PM2..."
    npm install -g pm2
fi

echo "✅ PM2 已安裝: $(pm2 -v)"

# 設定環境變數
export NODE_ENV=production
export PORT=$PORT
export DB_PATH=${DEPLOY_DIR:-.}/data/jinhaoker.db

# 從正確目錄啟動
cd "$DEPLOY_DIR"

echo "📁 工作目錄：$DEPLOY_DIR"

# 停止舊進程
pm2 delete jinhaoker-pos 2>/dev/null || true

# 啟動服務
echo "🚀 啟動服務..."
pm2.start npm --name "jinhaoker-pos" -- start

# 保存進程列表
pm2 save

# 設定開機自啟
echo ""
echo "⚙️  設定開機自啟..."
pm2 startup systemd -u $(whoami) --hp $(dirname $(dirname $(which pm2)))

echo ""
echo "================================"
echo "  ✅ PM2 開機自啟設定完成！"
echo ""
echo "  🔧 操作指令："
echo "     啟動：pm2 start jinhaoker-pos"
echo "     停止：pm2 stop jinhaoker-pos"
echo "     重啟：pm2 restart jinhaoker-pos"
echo "     狀態：pm2 status"
echo "     日誌：pm2 logs jinhaoker-pos"
echo ""
echo "  🚀 PM2 Exec + Save 完成後會自動設定開機啟動"
echo "================================"