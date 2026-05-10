import React, { useState, useEffect } from 'react';
import {
  DollarSign, ClipboardList, TrendingUp, Star,
  ArrowUp, ArrowDown
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '../api/client';

function StatCard({ icon: Icon, label, value, change, changeLabel, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [orderStatsData, ordersData, menuData] = await Promise.all([
          api.getOrderStats(),
          api.getOrders({ limit: '10' }),
          api.getMenu(),
        ]);
        setStats(orderStatsData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  const weeklyData = stats?.weeklyRevenue?.map(d => ({
    date: d.date ? d.date.slice(5) : '',
    revenue: d.revenue || 0,
  })) || [];

  const popularData = stats?.popularItems?.map(d => ({
    name: d.name,
    orders: d.total_ordered || 0,
  })) || [];

  const todayStats = stats?.todayStats || {};
  const popularItem = popularData[0]?.name || '—';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">儀表板</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="今日營收"
          value={`NT$ ${todayStats.completed_revenue?.toLocaleString() || 0}`}
          color="bg-primary-500"
        />
        <StatCard
          icon={ClipboardList}
          label="今日訂單"
          value={todayStats.total_orders || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          label="今日總金額"
          value={`NT$ ${todayStats.total_revenue?.toLocaleString() || 0}`}
          color="bg-purple-500"
        />
        <StatCard
          icon={Star}
          label="熱門品項"
          value={popularItem}
          color="bg-amber-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">近 7 日營收趨勢</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FF6B35"
                strokeWidth={2}
                dot={{ fill: '#FF6B35', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">今日熱門排行</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={popularData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#FF6B35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">最新訂單</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">訂單編號</th>
                <th className="pb-3 font-medium">顧客</th>
                <th className="pb-3 font-medium">金額</th>
                <th className="pb-3 font-medium">狀態</th>
                <th className="pb-3 font-medium">時間</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.order_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-mono text-xs">{order.order_id}</td>
                  <td className="py-3">{order.customer_name}</td>
                  <td className="py-3 font-medium">NT$ {order.total_amount}</td>
                  <td className="py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-gray-500">{order.created_at?.slice(11, 16)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">暫無訂單</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-700',
    cooking: 'bg-blue-100 text-blue-700',
    delivering: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  const labels = {
    pending: '待處理',
    cooking: '製作中',
    delivering: '運送中',
    completed: '已完成',
    cancelled: '已取消',
  };

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
}

export { StatusBadge };