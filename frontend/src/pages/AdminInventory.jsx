import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../api/client';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getInventory(lowStockOnly);
      setInventory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [lowStockOnly]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">庫存管理</h1>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white rounded-xl border hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} /> 刷新
        </button>
      </div>

      {/* Filter */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={e => setLowStockOnly(e.target.checked)}
          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-700">只顯示低庫存食材</span>
      </label>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 font-medium">食材名稱</th>
                <th className="px-5 py-3 font-medium">單位</th>
                <th className="px-5 py-3 font-medium">庫存量</th>
                <th className="px-5 py-3 font-medium">安全庫存</th>
                <th className="px-5 py-3 font-medium">供應商</th>
                <th className="px-5 py-3 font-medium">狀態</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const isLow = item.stock_qty < item.safety_stock;
                return (
                  <tr key={item.ingredient_id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${isLow ? 'bg-red-50/50' : ''}`}>
                    <td className="px-5 py-4 font-medium">{item.name}</td>
                    <td className="px-5 py-4 text-gray-500">{item.unit}</td>
                    <td className="px-5 py-4 font-mono">{item.stock_qty}</td>
                    <td className="px-5 py-4 font-mono text-gray-500">{item.safety_stock}</td>
                    <td className="px-5 py-4 text-gray-500">{item.supplier_name || '—'}</td>
                    <td className="px-5 py-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <AlertTriangle size={12} /> 庫存不足
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          正常
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {inventory.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">暫無資料</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}