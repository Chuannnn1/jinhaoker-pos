import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X, Send, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { api } from '../api/client';

export default function CustomerOrder() {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [menuData, catData] = await Promise.all([
          api.getMenu(),
          api.getMenuCategories(),
        ]);
        setMenu(menuData);
        setCategories(catData);
        if (catData.length > 0) setActiveCategory(catData[0].category);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredMenu = activeCategory ? menu.filter(m => m.category === activeCategory) : menu;

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(c => c.item_id === item.item_id);
      if (existing) {
        return prev.map(c => c.item_id === item.item_id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function updateQty(itemId, delta) {
    setCart(prev => prev.map(c => {
      if (c.item_id !== itemId) return c;
      const newQty = c.quantity + delta;
      return newQty <= 0 ? null : { ...c, quantity: newQty };
    }).filter(Boolean));
  }

  function removeItem(itemId) {
    setCart(prev => prev.filter(c => c.item_id !== itemId));
  }

  const totalAmount = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);

  async function handleSubmit() {
    if (!customerName.trim()) { alert('請輸入稱呼'); return; }
    if (cart.length === 0) { alert('購物車是空的'); return; }
    setSubmitting(true);
    try {
      const orderId = await api.createOrder({
        customer_name: customerName.trim(),
        note: note.trim() || null,
        items: cart.map(c => ({ item_id: c.item_id, quantity: c.quantity, customization: null })),
      });
      setSuccess(orderId);
      setCart([]);
      setNote('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetOrder() {
    setSuccess(null);
    setCustomerName('');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">✅ 點餐成功！</h2>
          <p className="text-gray-500 mb-1">訂單編號</p>
          <p className="text-lg font-mono font-bold text-primary-500 mb-6">{success}</p>
          <button
            onClick={resetOrder}
            className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            再點一單
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-xl">
            🍱
          </div>
          <div>
            <h1 className="font-bold text-gray-800">金濠客食堂</h1>
            <p className="text-xs text-gray-400">今日營業中</p>
          </div>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative p-2.5 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
        >
          <ShoppingCart size={22} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {totalItems}
            </span>
          )}
        </button>
      </header>

      {/* Customer Name */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <input
          type="text"
          placeholder="你的稱呼（例如：王小明）"
          className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.category
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.category} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {filteredMenu.map(item => (
            <button
              key={item.item_id}
              onClick={() => addToCart(item)}
              className="bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all active:scale-[0.98]"
            >
              {/* Image placeholder */}
              <div className="w-full aspect-video bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl mb-3 flex items-center justify-center">
                <UtensilsCrossed size={24} className="text-primary-400" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-0.5">{item.name}</h3>
              {item.description && (
                <p className="text-xs text-gray-400 mb-2 line-clamp-1">{item.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-primary-500">NT$ {item.price}</span>
                <span className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center">
                  <Plus size={16} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary-500" />
                購物車 ({totalItems})
              </h2>
              <button onClick={() => setShowCart(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-3">
              {cart.map(item => (
                <div key={item.item_id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">NT$ {item.price} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.item_id, -1)} className="w-7 h-7 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100">
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.item_id, 1)} className="w-7 h-7 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100">
                      <Plus size={14} />
                    </button>
                    <button onClick={() => removeItem(item.item_id)} className="p-1.5 text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                  <p>購物車是空的</p>
                  <p className="text-xs mt-1">點擊餐點加入</p>
                </div>
              )}
            </div>

            {/* Note */}
            <div className="px-5 py-3 border-t">
              <input
                type="text"
                placeholder="備註（例如：不要辣）"
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            {/* Checkout */}
            <div className="px-5 py-4 border-t bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">共 {totalItems} 項</span>
                <span className="text-xl font-bold text-gray-800">NT$ {totalAmount}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0 || !customerName.trim()}
                className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? '送出中...' : '送出訂單'}
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom bar for cart */}
      {totalItems > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto bg-primary-500 text-white rounded-2xl py-3.5 shadow-lg flex items-center justify-center gap-2 font-medium z-10"
        >
          <ShoppingCart size={20} />
          檢視購物車 · {totalItems} 項 · NT$ {totalAmount}
        </button>
      )}
    </div>
  );
}