'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
// db import removed — client component cannot import better-sqlite3

const COLORS = ['#FF6B35', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0']

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/orders/stats')
        const result = await res.json()
        if (result.success) setStats(result.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">載入中...</div>
  if (!stats) return <div className="text-center py-12 text-red-500">載入失敗</div>

  const { todayStats, popularItems, statusCounts, lowStockCount, weeklyRevenue } = stats

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#FF6B35' }}>儀表板</h1>

      {/* 快速統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary">
          <div className="text-gray-500 text-sm">今日訂單</div>
          <div className="text-3xl font-bold mt-2">{todayStats.total_orders}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="text-gray-500 text-sm">今日營收</div>
          <div className="text-3xl font-bold mt-2">NT${todayStats.total_revenue}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="text-gray-500 text-sm">已完成營收</div>
          <div className="text-3xl font-bold mt-2">NT${todayStats.completed_revenue}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="text-gray-500 text-sm">低庫存提醒</div>
          <div className="text-3xl font-bold mt-2">{lowStockCount} 項</div>
        </div>
      </div>

      {/* 圖表區 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 熱門品項 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">熱門品項 Top 5</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="total_ordered" fill="#FF6B35" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 訂單狀態 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">訂單狀態分佈</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusCounts} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                  {statusCounts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 近 7 日營收 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">近 7 日營收</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}