import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/orders/stats
export async function GET() {
  try {
    const db = getDb()

    // 今日統計
    const todayStats = db.prepare(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN status IN ('completed','delivering') THEN total_amount ELSE 0 END), 0) as completed_revenue,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM "order"
      WHERE date(created_at) = date('now', '+8 hours')
    `).get()

    // 近 7 日營收
    const weeklyRevenue = db.prepare(`
      SELECT date(created_at) as date, SUM(total_amount) as revenue
      FROM "order"
      WHERE date(created_at) >= date('now', '+8 hours', '-6 days')
      GROUP BY date(created_at)
      ORDER BY date(created_at)
    `).all()

    // 熱門品項
    const popularItems = db.prepare(`
      SELECT oi.item_name as name, SUM(oi.quantity) as total_ordered
      FROM order_item oi
      GROUP BY oi.item_name
      ORDER BY total_ordered DESC
      LIMIT 5
    `).all()

    // 各狀態訂單數
    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count FROM "order" GROUP BY status
    `).all()

    // 低庫存提醒
    const lowStock = db.prepare(`
      SELECT COUNT(*) as count FROM ingredient WHERE stock_qty <= low_stock_threshold
    `).get()

    return NextResponse.json({
      success: true,
      data: {
        todayStats,
        weeklyRevenue,
        popularItems,
        statusCounts,
        lowStockCount: lowStock.count,
      }
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}