function errorHandler(err, req, res, _next) {
  console.error('❌ Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || '伺服器內部錯誤'
  });
}

module.exports = errorHandler;