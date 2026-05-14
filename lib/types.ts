// ============================================================
// 金濠客食堂 POS — 共用 TypeScript 介面
// ============================================================

// --- Ingredient ---
export interface Ingredient {
  ingredient_id: number
  name: string
  unit: string
  stock_qty: number
  low_stock_threshold: number
  supplier_id: number | null
  is_active: number
  created_at: string
  updated_at: string
}

// --- Menu Item ---
export interface MenuItem {
  item_id: number
  name: string
  category: string
  price: number
  description: string | null
  image_url: string | null
  is_active: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface MenuItemWithRecipe extends MenuItem {
  recipe: RecipeEntry[]
}

export interface RecipeEntry {
  ingredient_id: number
  ingredient_name?: string
  consume_qty: number
  unit?: string
}

// --- Create Menu Input ---
export interface CreateMenuInput {
  name: string
  category: string
  price: number
  description?: string
  image_url?: string
  ingredients?: CreateRecipeEntry[]
}

export interface CreateRecipeEntry {
  ingredient_id: number
  consume_qty: number
}

// --- Update Menu Input ---
export interface UpdateMenuInput {
  name?: string
  category?: string
  price?: number
  description?: string
  image_url?: string
  is_active?: number
  sort_order?: number
  ingredients?: CreateRecipeEntry[]
}

// --- API Response ---
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// --- Category ---
export interface Category {
  category: string
}