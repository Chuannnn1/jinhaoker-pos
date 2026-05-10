import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const db = getDb()

    let items
    if (category) {
      items = db.prepare('SELECT * FROM menu_item WHERE is_active = 1 AND category = ? ORDER BY sort_order').all(category)
    } else {
      items = db.prepare('SELECT * FROM menu_item WHERE is_active = 1 ORDER BY category, sort_order').all()
    }

    return NextResponse.json({ success: true, data: items })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, category, price, description, image_url, recipe } = body
    if (!name || price === undefined || !category) {
      return NextResponse.json({ success: false, error: 'name、category、price 為必填欄位' }, { status: 400 })
    }

    const db = getDb()
    const result = db.prepare('INSERT INTO menu_item (name, category, price, description, image_url) VALUES (?, ?, ?, ?, ?)').run(name, category, price, description || null, image_url || null)
    const itemId = result.lastInsertRowid

    if (recipe && Array.isArray(recipe)) {
      const insertRecipe = db.prepare('INSERT OR REPLACE INTO recipe (item_id, ingredient_id, consume_qty) VALUES (?, ?, ?)')
      for (const r of recipe) {
        insertRecipe.run(itemId, r.ingredient_id, r.consume_qty)
      }
    }

    return NextResponse.json({ success: true, data: { item_id: Number(itemId) } }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}