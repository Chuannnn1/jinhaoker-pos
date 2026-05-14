#!/bin/bash
# ============================================================
# 金濠客 POS — 系統服務設定腳本（需 sudo）
# 使用方式：sudo ./setup-service.sh
# ============================================================
set -e

echo "================================"
echo "  🔧 POS 系統服務設定"
echo "================================"
echo ""

# 預設值（可透過環境變數覆蓋）
DEPLOY_DIR=${DEPLOY_DIR:-/opt/jinhaoker-pos}
LOG_DIR=${LOG_DIR:-/var/log/jinhaoker-pos}
SERVICE_NAME="jinhaoker-pos"
PORT=${PORT:-3100}

# 確認以 root 執行
if [ "$EUID" -ne 0 ]; then
    echo "❌ 請使用 sudo 執行：sudo ./setup-service.sh"
    exit 1
fi

echo "📁 部署目錄：$DEPLOY_DIR"
echo "📁 日誌目錄：$LOG_DIR"
echo "🔌 Port: $PORT"
echo ""

# 建立目錄
echo "📂 建立目錄結構..."
mkdir -p "$DEPLOY_DIR/data"
mkdir -p "$LOG_DIR"

# 複製專案檔案（如果沒有目標目錄，則從當前目錄複製）
if [ ! -f "$DEPLOY_DIR/package.json" ]; then
    echo "📦 複製專案檔案..."
    cp -r /home/node/.openclaw/workspace/jinhaoker-pos/* "$DEPLOY_DIR/" 2>/dev/null || \
    cp -r ./* "$DEPLOY_DIR/" 2>/dev/null || \
    echo "⚠️  無法自動複製檔案，請手動複製到 $DEPLOY_DIR"
fi

# 安裝依賴
echo "📦 安裝 Node.js 依賴..."
cd "$DEPLOY_DIR"
npm ci --production

# 初始化資料庫
if [ ! -f "$DEPLOY_DIR/data/jinhaoker.db" ]; then
    echo "🗃️  初始化資料庫..."
    npm run db:init
fi

# 建立 build
echo "🔨 建立生產構建..."
npm run build

# 複製 service 檔案
echo "⚙️  設定 systemd 服務..."
cp "$DEPLOY_DIR/jinhaoker-pos.service" /etc/systemd/system/

# 重新載入 systemd
systemctl daemon-reload

# 啟用並啟動服務
systemctl enable "$SERVICE_NAME"
systemctl start "$SERVICE_NAME"

# 檢查狀態
echo ""
echo "🔍 檢查服務狀態..."
systemctl status "$SERVICE_NAME" --no-pager

echo ""
echo "================================"
echo "  ✅ 系統服務設定完成！"
echo ""
echo "  🔧 操作指令："
echo "     啟動：sudo systemctl start $SERVICE_NAME"
echo "     停止：sudo systemctl stop $SERVICE_NAME"
echo "     重啟：sudo systemctl restart $SERVICE_NAME"
echo "     狀態：sudo systemctl status $SERVICE_NAME"
echo "     日誌：sudo journalctl -u $SERVICE_NAME -f"
echo ""
echo "  🔥 開啟防火牆（如需要）："
echo "     sudo ufw allow $PORT"
echo "     sudo ufw enable"
echo ""
echo "  🌐 存取 URL："
echo "     http://localhost:$PORT (本機)"
echo "     http://[SERVER_IP]:$PORT (公開)"
echo "================================"