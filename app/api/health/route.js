import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ success: true, data: { status: 'running', timestamp: new Date().toISOString() } })
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { action, ...payload } = body
    
    if (action === 'seed') {
      // Dynamically import and run seed
      return NextResponse.json({ success: true, data: { message: '資料庫已就緒，無需動態建立' } })
    }
    
    return NextResponse.json({ success: true, data: { status: 'ok' } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}