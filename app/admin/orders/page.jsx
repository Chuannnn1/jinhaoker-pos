'use client'
import { useEffect, useState } from 'react'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const statusLabels = {
    pending: '待處理', cooking: '烹調中', delivering: '外送中', completed: '已完成', cancelled: '已取消'
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      const url = statusFilter === 'all' ? '/api/orders' : `/api/orders?status=${statusFilter}`
      const res = await fetch(url)
      const result = await res.json()
      if (result.success) setOrders(result.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const result = await res.json()
      if (result.success) fetchOrders()
      else alert(result.error)
    } catch (err) {
      alert('錯誤：' + err.message)
    }
  }

  if (loading) return <div className="text-center py-12">載入中...</div>

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#FF6B35' }}>訂單管理</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'cooking', 'delivering', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium ${statusFilter === status ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
          >
            {status === 'all' ? '全部' : statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">訂單編號</th>
              <th className="px-4 py-3 text-left font-semibold">顧客</th>
              <th className="px-4 py-3 text-left font-semibold">金額</th>
              <th className="px-4 py-3 text-left font-semibold">狀態</th>
              <th className="px-4 py-3 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.order_id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">{order.order_id}</td>
                <td className="px-4 py-3">{order.customer_name}</td>
                <td className="px-4 py-3">NT${order.total_amount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {statusLabels[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {order.status === 'pending' && (
                    <select value="" onChange={e => e.target.value && updateStatus(order.order_id, e.target.value)} className="border rounded px-2 py-1 text-sm">
                      <option value="">變更狀態</option>
                      <option value="cooking">→ 烹調中</option>
                      <option value="cancelled">→ 已取消</option>
                    </select>
                  )}
                  {order.status === 'cooking' && (
                    <select value="" onChange={e => e.target.value && updateStatus(order.order_id, e.target.value)} className="border rounded px-2 py-1 text-sm">
                      <option value="">變更狀態</option>
                      <option value="delivering">→ 外送中</option>
                      <option value="cancelled">→ 已取消</option>
                    </select>
                  )}
                  {order.status === 'delivering' && (
                    <button onClick={() => updateStatus(order.order_id, 'completed')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                      改為已完成
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">沒有訂單</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}