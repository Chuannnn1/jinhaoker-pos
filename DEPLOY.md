# 金濠客 POS — 部署文件

## 📦 專案概述

金濠客食堂 POS 系統 — Next.js 14 全端解決方案，包含前台點餐 + 後台管理。

- **前台**: `http://localhost:3100`
- **後台**: `http://localhost:3100/admin/dashboard`
- **API**: `http://localhost:3100/api/health`

---

## 🚀 快速部署

### 方案 A：本地資源伺服器（推薦）

**適用場景**: 已有可用 VM/主機，需要 7x24 運行

```bash
# 1. Clone 專案
git clone https://github.com/Chuannnn1/jinhaoker-pos.git
cd jinhaoker-pos

# 2. 一鍵部署（自動處理依賴、DB、啟動）
chmod +x deploy.sh
./deploy.sh
```

**預設設定**:
- Port: `3100`
- DB Path: `./data/jinhaoker.db`
- Node 版本要求: `>= 18`

---

### 方案 B：systemd 服務（Linux Production）

**適用場景**: 需要系統級服務管理、開機自啟、自動重啟

```bash
# 1. Clone 專案（同上）

# 2. 使用 systemd 部署（需 sudo）
sudo ./setup-service.sh

# 3. 管理服務
sudo systemctl start jinhaoker-pos
sudo systemctl stop jinhaoker-pos
sudo systemctl restart jinhaoker-pos
sudo systemctl status jinhaoker-pos

# 4. 查看日誌
sudo journalctl -u jinhaoker-pos -f
```

**安裝位置**:
- 程式碼: `/opt/jinhaoker-pos`
- 日誌: `/var/log/jinhaoker-pos/`
- 資料: `/opt/jinhaoker-pos/data/`

---

### 方案 C：PM2 管理（Node.js 優先）

**適用場景**: 喜歡用 PM2 管理 Node.js 應用，需要資源監控、自動重啟

```bash
# 1. Clone 專案（同上）

# 2. 使用 PM2 部署
./setup-pm2.sh

# 3. 管理服務
pm2 start jinhaoker-pos
pm2 stop jinhaoker-pos
pm2 restart jinhaoker-pos
pm2 status
pm2 logs jinhaoker-pos

# 4. 開機自啟（腳本會自動設定）
pm2 startup
pm2 save
```

---

## 🔧 手動部署（進階）

```bash
# 1. Clone
git clone https://github.com/Chuannnn1/jinhaoker-pos.git
cd jinhaoker-pos

# 2. 複製環境變數
cp .env.production .env
# 編輯 .env 調整設定（PORT, DB_PATH 等）

# 3. 安裝依賴
npm ci --production

# 4. 初始化資料庫
npm run db:init

# 5. 建立生產包
npm run build

# 6. 啟動服務
npm start
# 或後台執行：nohup npm start > logs/pos.log 2>&1 &
```

---

## 🔥 防火牆設定

```bash
# Ubuntu (ufw)
sudo ufw allow 3100
sudo ufw enable

# CentOS/Firewalld
sudo firewall-cmd --permanent --add-port=3100/tcp
sudo firewall-cmd --reload
```

---

## 🌐 外部存取設定

### Tailscale 內網（推薦給家用 VPN）

```bash
# 在有 Tailscale 的主機上部署
sudo ./setup-service.sh

# 用 Tailscale IP 連線
# http://<tailscale-ip>:3100
```

### 公開 IP + Nginx（適合正式生產）

```nginx
# /etc/nginx/sites-available/jinhaoker-pos
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 啟用在 Nginx
sudo ln -s /etc/nginx/sites-available/jinhaoker-pos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 監控設定

### PM2 + PM2 Monitor

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Prometheus + Grafana（進階）

使用 `pm2-prometheus-exporter` + Prometheus 抓取系統指標

---

## 🛠️ 容器化部署（Docker）

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 3100
CMD ["npm", "start"]
```

```bash
# 建置
docker build -t jinhaoker-pos .

# 運行
docker run -d -p 3100:3100 \
  -v pos-data:/app/data \
  -e PORT=3100 \
  -e DB_PATH=/app/data/jinhaoker.db \
  --name jinhaoker-pos \
  jinhaoker-pos
```

---

## 📋 常見問題

### Q: build 失敗？
A: 確認 Node 版本 >= 18，並清除 node_modules 後重新：
```bash
rm -rf node_modules .next
npm ci
npm run build
```

### Q: 資料庫找不到？
A: 確認 DB_PATH 正確，並執行初始化：
```bash
npm run db:init
```

### Q: 端口被佔用？
A: 修改 `.env` 中的 `PORT`，或停止舊進程：
```bash
sudo lsof -i :3100  # 查看佔用
sudo kill -9 <PID>  # 殺進程
```

### Q: 如何升級版本？
A:
```bash
git pull origin main
npm ci
npm run build
pm2 restart jinhaoker-pos  # 或 systemctl restart jinhaoker-pos
```

---

## 📞 支援

- **技術問題**: GitHub Issues
- **功能需求**: 請先閱讀 `docs/SPEC.md`
- **部署協助**: 請參考本文件各章節

---

**最後更新**: 2026-05-12