'use client'
import { useEffect, useState } from 'react'

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [newQty, setNewQty] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [showLowStock])

  const fetchInventory = async () => {
    try {
      const url = showLowStock ? '/api/inventory/check' : '/api/inventory'
      const res = await fetch(url)
      const result = await res.json()
      if (result.success) setInventory(result.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (item) => {
    try {
      const res = await fetch(`/api/inventory/${item.ingredient_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_qty: Number(newQty) })
      })
      const result = await res.json()
      if (result.success) {
        alert('庫存已更新')
        fetchInventory()
        setEditingId(null)
      } else {
        alert(result.error)
      }
    } catch (err) {
      alert('錯誤：' + err.message)
    }
  }

  if (loading) return <div className="text-center py-12">載入中...</div>

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#FF6B35' }}>庫存管理</h1>
        <button
          onClick={() => setShowLowStock(!showLowStock)}
          className={`px-4 py-2 rounded-lg font-medium ${showLowStock ? 'bg-red-500 text-white' : 'bg-white text-gray-700'}`}
        >
          {showLowStock ? '顯示全部' : '只看低庫存'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">食材名稱</th>
              <th className="px-4 py-3 text-left font-semibold">單位</th>
              <th className="px-4 py-3 text-left font-semibold">庫存</th>
              <th className="px-4 py-3 text-left font-semibold">低庫存閾值</th>
              <th className="px-4 py-3 text-left font-semibold">供應商</th>
              <th className="px-4 py-3 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.ingredient_id} className={`border-t ${item.stock_qty <= item.low_stock_threshold ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.unit}</td>
                <td className={`px-4 py-3 font-bold ${item.stock_qty <= item.low_stock_threshold ? 'text-red-600' : ''}`}>
                  {Number(item.stock_qty).toFixed(1)}
                </td>
                <td className="px-4 py-3">{Number(item.low_stock_threshold).toFixed(1)}</td>
                <td className="px-4 py-3 text-sm">{item.supplier_name || '-'}</td>
                <td className="px-4 py-3">
                  {editingId === item.ingredient_id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newQty}
                        onChange={e => setNewQty(e.target.value)}
                        className="border rounded px-2 py-1 w-24"
                        placeholder="新庫存"
                      />
                      <button onClick={() => handleEdit(item)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">儲存</button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400">取消</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingId(item.ingredient_id); setNewQty(item.stock_qty) }} className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                      調整庫存
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">沒有資料</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}