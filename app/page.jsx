'use client'
import { useEffect, useState } from 'react'

export default function CustomerOrderPage() {
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          fetch('/api/menu'),
          fetch('/api/menu/categories')
        ])
        const menuData = await menuRes.json()
        const catData = await catRes.json()
        if (menuData.success) setMenu(menuData.data)
        if (catData.success) setCategories(catData.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.item_id === item.item_id)
      if (existing) {
        return prev.map(i => i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { item_id: item.item_id, name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.item_id !== itemId))
  }

  const updateQuantity = (itemId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.item_id === itemId) {
        const newQty = Math.max(1, i.quantity + delta)
        return { ...i, quantity: newQty }
      }
      return i
    }))
  }

  const handleSubmit = async () => {
    if (!customerName) return alert('請輸入顧客姓名')
    if (cart.length === 0) return alert('購物車為空')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone || null,
          note: note || null,
          items: cart.map(i => ({ item_id: i.item_id, quantity: i.quantity }))
        })
      })
      const result = await res.json()
      if (result.success) {
        alert('訂單建立成功！\n單號：' + result.data.order_id)
        setCart([])
        setCustomerName('')
        setCustomerPhone('')
        setNote('')
      } else {
        alert('建立失敗：' + result.error)
      }
    } catch (err) {
      alert('錯誤：' + err.message)
    }
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const filteredMenu = activeCategory === 'all' 
    ? menu 
    : menu.filter(item => item.category === activeCategory)

  if (loading) return <div className="text-center py-12">載入中...</div>

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">金濠客食堂 — 點餐系統</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium ${activeCategory === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
              >
                全部
              </button>
              {categories.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  className={`px-4 py-2 rounded-lg font-medium ${activeCategory === cat.category ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
                >
                  {cat.category} ({cat.count})
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenu.map(item => (
                <div key={item.item_id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{item.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">NT${item.price}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="mt-4 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    + 加入購物車
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">購物車</h2>

              {/* Customer Info */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">顧客姓名 *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="請輸入姓名"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">電話 (可選)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="09xx-xxx-xxx"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">備註</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="例如：不要辣、外帶等"
                  rows="2"
                />
              </div>

              {/* Cart Items */}
              <div className="border-t pt-4 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">購物車為空</p>
                ) : (
                  cart.map(item => (
                    <div key={item.item_id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">NT${item.price} × {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.item_id, -1)}
                          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300"
                        >−</button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.item_id, 1)}
                          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300"
                        >+</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total & Submit */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">總計</span>
                  <span className="text-3xl font-bold text-primary">NT${total}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={cart.length === 0 || !customerName}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  提交訂單
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}