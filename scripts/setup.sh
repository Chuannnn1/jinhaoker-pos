#!/bin/bash
# ============================================================
# 金濠客 POS — 一鍵安裝腳本
# ============================================================
set -e

echo "================================"
echo "  🍱 金濠客食堂 POS 系統"
echo "  一鍵安裝腳本"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 請先安裝 Node.js (v18+)"
    echo "   下載：https://nodejs.org/"
    exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
    echo "❌ Node.js 版本需 >= 18，目前為 $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v)"

# Create data directory
mkdir -p data

# Install backend deps
echo ""
echo "📦 安裝後端依賴..."
cd backend
npm install --silent
cd ..

# Install frontend deps
echo "📦 安裝前端依賴..."
cd frontend
npm install --silent
cd ..

# Init database
echo ""
echo "🗃️  初始化資料庫..."
cd backend
npm run db:init
cd ..

echo ""
echo "================================"
echo "  ✅ 安裝完成！"
echo ""
echo "  🔧 開發模式（需要兩個終端機）："
echo "     Term 1: cd backend && npm run dev"
echo "     Term 2: cd frontend && npm run dev"
echo ""
echo "  🚀 Production 模式："
echo "     cd frontend && npm run build"
echo "     cd backend && npm start"
echo ""
echo "  前台：http://localhost:5173"
echo "  後台：http://localhost:5173/admin"
echo "  API： http://localhost:3000/api/health"
echo "================================"