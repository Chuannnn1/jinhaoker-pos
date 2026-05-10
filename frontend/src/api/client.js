const API_BASE = '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const res = await fetch(url, config);
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || '請求失敗');
  }

  return json.data;
}

export const api = {
  // Menu
  getMenu: (category) => request(`/menu${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  getMenuCategories: () => request('/menu/categories'),
  getMenuItem: (id) => request(`/menu/${id}`),
  createMenuItem: (data) => request('/menu', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id, data) => request(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMenuItem: (id) => request(`/menu/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/orders${qs ? `?${qs}` : ''}`);
  },
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getOrderStats: () => request('/orders/stats'),

  // Inventory
  getInventory: (lowStock) => request(`/inventory${lowStock ? '?low_stock=true' : ''}`),
  getInventoryItem: (id) => request(`/inventory/${id}`),
  updateStock: (id, stockQty) => request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify({ stock_qty: stockQty }) }),
  checkLowStock: () => request('/inventory/check'),

  // Purchase Orders
  getPurchaseOrders: () => request('/purchase-orders'),
  getPurchaseOrder: (id) => request(`/purchase-orders/${id}`),
  createPurchaseOrder: (data) => request('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  receivePurchaseOrder: (id, items) => request(`/purchase-orders/${id}/receive`, { method: 'POST', body: JSON.stringify({ items }) }),

  // Suppliers
  getSuppliers: () => request('/suppliers'),
  createSupplier: (data) => request('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
};