// ============================================================
// Menu API [id] — GET / PUT / DELETE
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { MenuItemWithRecipe, UpdateMenuInput, ApiResponse } from '@/lib/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/menu/[id] — 取得單一餐點（含食譜）
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<MenuItemWithRecipe>>> {
  try {
    const { id } = await params
    const itemId = Number(id)

    if (isNaN(itemId)) {
      return NextResponse.json({ success: false, error: '無效的 ID' }, { status: 400 })
    }

    const db = getDb()

    const item = db.prepare('SELECT * FROM menu_item WHERE item_id = ?').get(itemId) as
      | MenuItemWithRecipe
      | undefined

    if (!item) {
      return NextResponse.json({ success: false, error: '餐點不存在' }, { status: 404 })
    }

    const recipe = db
      .prepare(
        `SELECT r.ingredient_id, r.consume_qty, i.name as ingredient_name, i.unit
         FROM recipe r
         JOIN ingredient i ON r.ingredient_id = i.ingredient_id
         WHERE r.item_id = ?`
      )
      .all(itemId) as MenuItemWithRecipe['recipe']

    return NextResponse.json({ success: true, data: { ...item, recipe } })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}

// PUT /api/menu/[id] — 更新餐點（含食譜更新 Transaction）
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<MenuItemWithRecipe>>> {
  try {
    const { id } = await params
    const itemId = Number(id)

    if (isNaN(itemId)) {
      return NextResponse.json({ success: false, error: '無效的 ID' }, { status: 400 })
    }

    const body: UpdateMenuInput = await req.json()
    const db = getDb()

    // 先確認存在
    const existing = db.prepare('SELECT * FROM menu_item WHERE item_id = ?').get(itemId) as
      | MenuItemWithRecipe
      | undefined

    if (!existing) {
      return NextResponse.json({ success: false, error: '餐點不存在' }, { status: 404 })
    }

    // Transaction：更新 menu_item + 更新 recipe（如有）
    const updateMenu = db.transaction((data: UpdateMenuInput) => {
      // Step 1: 更新 menu_item 基本資料
      db.prepare(
        `UPDATE menu_item
         SET name = ?, category = ?, price = ?, description = ?, image_url = ?,
             is_active = ?, sort_order = ?, updated_at = datetime('now', '+8 hours')
         WHERE item_id = ?`
      ).run(
        data.name ?? existing.name,
        data.category ?? existing.category,
        data.price ?? existing.price,
        data.description !== undefined ? data.description : existing.description,
        data.image_url !== undefined ? data.image_url : existing.image_url,
        data.is_active ?? existing.is_active,
        data.sort_order ?? existing.sort_order,
        itemId
      )

      // Step 2: 若有 ingredients，替換整個 recipe（全刪全插）
      if (data.ingredients !== undefined) {
        // 先刪除舊的 recipe
        db.prepare('DELETE FROM recipe WHERE item_id = ?').run(itemId)

        // 驗證所有 ingredient 存在
        const checkIng = db.prepare('SELECT ingredient_id FROM ingredient WHERE ingredient_id = ?')
        for (const ing of data.ingredients) {
          const exists = checkIng.get(ing.ingredient_id) as { ingredient_id: number } | undefined
          if (!exists) {
            throw new Error(`食材 ID ${ing.ingredient_id} 不存在`)
          }
        }

        // 插入新的 recipe
        const insertRecipe = db.prepare(
          'INSERT INTO recipe (item_id, ingredient_id, consume_qty) VALUES (?, ?, ?)'
        )
        for (const ing of data.ingredients) {
          insertRecipe.run(itemId, ing.ingredient_id, ing.consume_qty)
        }
      }
    })

    updateMenu(body)

    // 回傳更新後的完整資料
    const updated = db.prepare('SELECT * FROM menu_item WHERE item_id = ?').get(itemId) as MenuItemWithRecipe
    const recipe = db
      .prepare(
        `SELECT r.ingredient_id, r.consume_qty, i.name as ingredient_name, i.unit
         FROM recipe r
         JOIN ingredient i ON r.ingredient_id = i.ingredient_id
         WHERE r.item_id = ?`
      )
      .all(itemId) as MenuItemWithRecipe['recipe']

    return NextResponse.json({ success: true, data: { ...updated, recipe } })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error }, { status: 400 })
  }
}

// DELETE /api/menu/[id] — 軟刪除（下架）
export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    const { id } = await params
    const itemId = Number(id)

    if (isNaN(itemId)) {
      return NextResponse.json({ success: false, error: '無效的 ID' }, { status: 400 })
    }

    const db = getDb()

    const existing = db.prepare('SELECT * FROM menu_item WHERE item_id = ?').get(itemId)
    if (!existing) {
      return NextResponse.json({ success: false, error: '餐點不存在' }, { status: 404 })
    }

    db.prepare(
      "UPDATE menu_item SET is_active = 0, updated_at = datetime('now', '+8 hours') WHERE item_id = ?"
    ).run(itemId)

    return NextResponse.json({ success: true, data: { message: '已下架' } })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}