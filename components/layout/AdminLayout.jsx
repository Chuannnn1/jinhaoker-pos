'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Utensils, LayoutDashboard, Receipt, Menu, Boxes, ShoppingCart } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: '儀表板' },
  { href: '/admin/menu', icon: Menu, label: '菜單管理' },
  { href: '/admin/orders', icon: Receipt, label: '訂單管理' },
  { href: '/admin/inventory', icon: Boxes, label: '庫存管理' },
  { href: '/', icon: ShoppingCart, label: '前台點餐' },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-white flex-shrink-0 hidden md:block">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-primary">金濠客食堂</h1>
          <p className="text-gray-400 text-sm">POS 管理系統</p>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${
                  isActive ? 'bg-gray-800 border-l-4 border-primary text-primary' : 'text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar text-white flex items-center justify-between px-4 z-10">
        <h1 className="font-bold">金濠客食堂</h1>
        <Link href="/admin/dashboard" className="text-primary">
          <LayoutDashboard className="w-6 h-6" />
        </Link>
      </div>

      {/* Main Content */}
      <main className={`flex-1 p-6 ${pathname.startsWith('/admin') ? 'mt-16 md:mt-0' : ''}`}>
        {children}
      </main>
    </div>
  )
}