import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { api } from '../api/client';

const categories = ['主餐', '湯品', '加點', '飲料'];

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    name: '', category: '主餐', price: '', description: '', is_active: true
  });

  async function loadMenu() {
    setLoading(true);
    try {
      const data = await api.getMenu();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMenu(); }, []);

  const filtered = items.filter(item => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (search && !item.name.includes(search)) return false;
    return true;
  });

  function openCreate() {
    setEditItem(null);
    setForm({ name: '', category: '主餐', price: '', description: '', is_active: true });
    setShowForm(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      name: item.name,
      category: item.category || '主餐',
      price: String(item.price),
      description: item.description || '',
      is_active: !!item.is_active,
    });
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        description: form.description || null,
        is_active: form.is_active,
      };
      if (editItem) {
        await api.updateMenuItem(editItem.item_id, data);
      } else {
        await api.createMenuItem(data);
      }
      setShowForm(false);
      loadMenu();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('確定要下架此餐點？')) return;
    try {
      await api.deleteMenuItem(id);
      loadMenu();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">菜單管理</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus size={18} /> 新增餐點
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="搜尋餐點..."
            className="pl-9 pr-4 py-2.5 bg-white border rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">全部分類</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.item_id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mb-2">
                  {item.category}
                </span>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(item.item_id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-lg font-bold text-primary-500">NT$ {item.price}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {item.is_active ? '上架中' : '已下架'}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">暫無餐點，點擊「新增餐點」開始</div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editItem ? '編輯餐點' : '新增餐點'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">餐點名稱 *</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
                  <select
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">售價 (NT$) *</label>
                  <input
                    type="number" required min="0"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox" id="is_active"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">上架</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium hover:bg-gray-50">
                  取消
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600">
                  {editItem ? '儲存' : '新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}