import './globals.css'

export const metadata = {
  title: '金濠客食堂 POS',
  description: '金濠客食堂 POS 系統 — 前台點餐 + 後台管理',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-page">
        {children}
      </body>
    </html>
  )
}