import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { StatusBadge } from './AdminDashboard';

const statusLabels = {
  pending: '待處理',
  cooking: '製作中',
  delivering: '運送中',
  completed: '已完成',
  cancelled: '已取消',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionOrder, setActionOrder] = useState(null);

  async function loadOrders() {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await api.getOrders(params);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, [statusFilter]);

  const filtered = orders.filter(o =>
    !search || o.customer_name.includes(search) || o.order_id.includes(search)
  );

  async function handleStatusUpdate(orderId, newStatus) {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setActionOrder(null);
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  }

  const nextStatuses = {
    pending: [{ value: 'cooking', label: '開始製作' }, { value: 'cancelled', label: '取消訂單', danger: true }],
    cooking: [{ value: 'delivering', label: '標記為運送中' }, { value: 'cancelled', label: '取消訂單', danger: true }],
    delivering: [{ value: 'completed', label: '完成送餐' }],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">訂單管理</h1>
        <button onClick={loadOrders} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white rounded-xl border hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} /> 刷新
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋訂單或客戶..."
            className="pl-9 pr-4 py-2.5 bg-white border rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">全部狀態</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 font-medium">訂單編號</th>
                <th className="px-5 py-3 font-medium">顧客</th>
                <th className="px-5 py-3 font-medium">金額</th>
                <th className="px-5 py-3 font-medium">狀態</th>
                <th className="px-5 py-3 font-medium">時間</th>
                <th className="px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.order_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs">{order.order_id}</td>
                  <td className="px-5 py-4">{order.customer_name}</td>
                  <td className="px-5 py-4 font-medium">NT$ {order.total_amount}</td>
                  <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-4 text-gray-500">{order.created_at?.slice(11, 16)}</td>
                  <td className="px-5 py-4">
                    {nextStatuses[order.status] && (
                      <div className="relative">
                        <button
                          onClick={() => setActionOrder(actionOrder === order.order_id ? null : order.order_id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          操作 <ChevronDown size={14} />
                        </button>
                        {actionOrder === order.order_id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border rounded-xl shadow-lg z-10 py-1">
                            {nextStatuses[order.status].map(action => (
                              <button
                                key={action.value}
                                onClick={() => handleStatusUpdate(order.order_id, action.value)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${action.danger ? 'text-red-600' : 'text-gray-700'}`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">暫無訂單</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}