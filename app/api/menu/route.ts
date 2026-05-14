// ============================================================
// Menu API — GET / POST
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { MenuItem, CreateMenuInput, ApiResponse } from '@/lib/types'

// GET /api/menu — 取得所有（可依 category 過濾）
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<MenuItem[]>>> {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const db = getDb()

    let items: MenuItem[]
    if (category) {
      items = db
        .prepare('SELECT * FROM menu_item WHERE is_active = 1 AND category = ? ORDER BY sort_order')
        .all(category) as MenuItem[]
    } else {
      items = db
        .prepare('SELECT * FROM menu_item WHERE is_active = 1 ORDER BY category, sort_order')
        .all() as MenuItem[]
    }

    return NextResponse.json({ success: true, data: items })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}

// POST /api/menu — 新增餐點（含 Transaction）
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ item_id: number }>>> {
  try {
    const body: CreateMenuInput = await req.json()
    const { name, category, price, description, image_url, ingredients } = body

    // 必填欄位驗證
    if (!name || price === undefined || !category) {
      return NextResponse.json(
        { success: false, error: 'name、category、price 為必填欄位' },
        { status: 400 }
      )
    }

    const db = getDb()

    // 建立 Transaction（含 ingredients 驗證 + 寫入）
    const createMenu = db.transaction((data: CreateMenuInput) => {
      // Step 1: 驗證所有 ingredient 存在
      if (data.ingredients && data.ingredients.length > 0) {
        const checkIng = db.prepare('SELECT ingredient_id FROM ingredient WHERE ingredient_id = ?')
        for (const ing of data.ingredients) {
          const exists = checkIng.get(ing.ingredient_id) as { ingredient_id: number } | undefined
          if (!exists) {
            throw new Error(`食材 ID ${ing.ingredient_id} 不存在`)
          }
        }
      }

      // Step 2: 插入 menu_item
      const result = db
        .prepare(
          `INSERT INTO menu_item (name, category, price, description, image_url)
           VALUES (?, ?, ?, ?, ?)`
        )
        .run(data.name, data.category, data.price, data.description || null, data.image_url || null)

      const itemId = Number(result.lastInsertRowid)

      // Step 3: 插入 recipe（如有）
      if (data.ingredients && data.ingredients.length > 0) {
        const insertRecipe = db.prepare(
          'INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (?, ?, ?)'
        )
        for (const ing of data.ingredients) {
          insertRecipe.run(itemId, ing.ingredient_id, ing.consume_qty)
        }
      }

      return itemId
    })

    const itemId = createMenu({ name, category, price, description, image_url, ingredients })

    return NextResponse.json({ success: true, data: { item_id: itemId as number } }, { status: 201 })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    // Transaction rollback 後會拋出錯誤，在此捕捉
    return NextResponse.json({ success: false, error }, { status: 400 })
  }
}