'use client'
import { useEffect, useState } from 'react'

export default function AdminMenuPage() {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ name: '', category: '主餐', price: '', description: '' })

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu')
      const result = await res.json()
      if (result.success) setMenu(result.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingItem ? `/api/menu/${editingItem.item_id}` : '/api/menu'
      const method = editingItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          is_active: formData.is_active !== undefined ? Number(formData.is_active) : 1
        })
      })
      const result = await res.json()
      if (result.success) {
        alert('儲存成功')
        fetchMenu()
        setShowForm(false)
        setEditingItem(null)
        setFormData({ name: '', category: '主餐', price: '', description: '' })
      } else {
        alert('儲存失敗：' + result.error)
      }
    } catch (err) {
      alert('錯誤：' + err.message)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item.id ?? item.item_id)
    setFormData({ ...item })
    setShowForm(true)
  }

  const handleToggle = async (item) => {
    try {
      const res = await fetch(`/api/menu/${item.item_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: item.is_active ? 0 : 1 })
      })
      const result = await res.json()
      if (result.success) fetchMenu()
      else alert(result.error)
    } catch (err) {
      alert('錯誤')
    }
  }

  if (loading) return <div className="text-center py-12">載入中...</div>

  const grouped = menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#FF6B35' }}>菜單管理</h1>
        <button
          onClick={() => { setShowForm(true); setEditingItem(null); setFormData({ name: '', category: '主餐', price: '', description: '' }) }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          + 新增餐點
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingItem ? '編輯餐點' : '新增餐點'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">名稱 *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">分類 *</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full border rounded px-3 py-2">
                  <option>主餐</option>
                  <option>湯品</option>
                  <option>加點</option>
                  <option>飲料</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">價格 *</label>
                <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">說明</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded px-3 py-2" rows="3" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark">儲存</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">取消</button>
            </div>
          </form>
        </div>
      )}

      {/* Menu List */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.item_id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{item.name}</h3>
                  <span className={`text-sm px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {item.is_active ? '上架' : '下架'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                <div className="text-xl font-bold text-primary">NT${item.price}</div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleEdit(item)} className="flex-1 bg-blue-100 text-blue-700 py-1 rounded hover:bg-blue-200">編輯</button>
                  <button onClick={() => handleToggle(item)} className={`flex-1 py-1 rounded ${item.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {item.is_active ? '下架' : '上架'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}