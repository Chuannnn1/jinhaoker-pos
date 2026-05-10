const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { closeDb } = require('./db/connection');

const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const purchaseRoutes = require('./routes/purchase');
const supplierRoutes = require('./routes/suppliers');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'running', timestamp: new Date().toISOString() } });
});

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchase-orders', purchaseRoutes);
app.use('/api/suppliers', supplierRoutes);

// 在 production 環境 serve 前端靜態檔
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDist, 'index.html'));
  }
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 關閉伺服器...');
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 金濠客 POS 系統已啟動 → http://localhost:${PORT}`);
  console.log(`📋 API: http://localhost:${PORT}/api/health`);
});

module.exports = app;