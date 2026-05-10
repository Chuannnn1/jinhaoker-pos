import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import CustomerOrder from './pages/CustomerOrder';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminMenu from './pages/AdminMenu';
import AdminInventory from './pages/AdminInventory';

export default function App() {
  return (
    <Routes>
      {/* 前台點餐 */}
      <Route path="/" element={<CustomerOrder />} />
      <Route path="/order" element={<CustomerOrder />} />

      {/* 後台管理（含 Sidebar Layout） */}
      <Route path="/admin" element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="menu" element={<AdminMenu />} />
        <Route path="inventory" element={<AdminInventory />} />
      </Route>
    </Routes>
  );
}