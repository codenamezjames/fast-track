export interface FoodSearchResult {
  id: string
  name: string
  brand?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: string
}

interface OpenFoodFactsProduct {
  _id: string
  product_name?: string
  brands?: string
  nutriments?: {
    'energy-kcal_100g'?: number
    'energy-kcal_serving'?: number
    proteins_100g?: number
    proteins_serving?: number
    carbohydrates_100g?: number
    carbohydrates_serving?: number
    fat_100g?: number
    fat_serving?: number
  }
  serving_size?: string
  nutrition_data_per?: string
}

interface OpenFoodFactsResponse {
  products: OpenFoodFactsProduct[]
  count: number
}

const RECENT_FOODS_KEY = 'fast-track-recent-foods'
const MAX_RECENT_FOODS = 20

export async function searchFoods(query: string): Promise<FoodSearchResult[]> {
  if (!query.trim()) return []

  try {
    const url = new URL('https://world.openfoodfacts.org/cgi/search.pl')
    url.searchParams.set('search_terms', query)
    url.searchParams.set('search_simple', '1')
    url.searchParams.set('action', 'process')
    url.searchParams.set('json', '1')
    url.searchParams.set('page_size', '20')
    url.searchParams.set('fields', 'product_name,brands,nutriments,serving_size,nutrition_data_per,_id')

    const response = await fetch(url.toString())
    if (!response.ok) throw new Error('Failed to fetch')

    const data: OpenFoodFactsResponse = await response.json()

    return data.products
      .filter((p) => p.product_name && p.nutriments)
      .map((product) => {
        const n = product.nutriments!
        // Prefer per-serving data if available, otherwise use per 100g
        const useServing = product.nutrition_data_per === 'serving' && n['energy-kcal_serving']

        return {
          id: product._id,
          name: product.product_name!,
          brand: product.brands,
          calories: Math.round(useServing ? (n['energy-kcal_serving'] || 0) : (n['energy-kcal_100g'] || 0)),
          protein: Math.round(useServing ? (n.proteins_serving || 0) : (n.proteins_100g || 0)),
          carbs: Math.round(useServing ? (n.carbohydrates_serving || 0) : (n.carbohydrates_100g || 0)),
          fat: Math.round(useServing ? (n.fat_serving || 0) : (n.fat_100g || 0)),
          servingSize: product.serving_size || (useServing ? 'per serving' : 'per 100g'),
        }
      })
      .filter((food) => food.calories > 0) // Only return foods with calorie data
  } catch (error) {
    console.error('Food search error:', error)
    return []
  }
}

export function getRecentFoods(): FoodSearchResult[] {
  try {
    const stored = localStorage.getItem(RECENT_FOODS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addToRecentFoods(food: FoodSearchResult): void {
  try {
    const recent = getRecentFoods()
    // Remove if already exists
    const filtered = recent.filter((f) => f.id !== food.id)
    // Add to front
    const updated = [food, ...filtered].slice(0, MAX_RECENT_FOODS)
    localStorage.setItem(RECENT_FOODS_KEY, JSON.stringify(updated))
  } catch {
    // Ignore localStorage errors
  }
}

export function clearRecentFoods(): void {
  try {
    localStorage.removeItem(RECENT_FOODS_KEY)
  } catch {
    // Ignore localStorage errors
  }
}

export async function lookupBarcode(barcode: string): Promise<FoodSearchResult | null> {
  if (!barcode.trim()) return null

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    )
    if (!response.ok) throw new Error('Failed to fetch')

    const data = await response.json()

    if (data.status !== 1 || !data.product) return null

    const product = data.product
    const n = product.nutriments || {}

    // Prefer per-serving data if available, otherwise use per 100g
    const useServing = product.nutrition_data_per === 'serving' && n['energy-kcal_serving']

    const calories = Math.round(useServing ? (n['energy-kcal_serving'] || 0) : (n['energy-kcal_100g'] || 0))

    // Only return if we have calorie data
    if (calories <= 0) return null

    return {
      id: product._id || barcode,
      name: product.product_name || 'Unknown Product',
      brand: product.brands,
      calories,
      protein: Math.round(useServing ? (n.proteins_serving || 0) : (n.proteins_100g || 0)),
      carbs: Math.round(useServing ? (n.carbohydrates_serving || 0) : (n.carbohydrates_100g || 0)),
      fat: Math.round(useServing ? (n.fat_serving || 0) : (n.fat_100g || 0)),
      servingSize: product.serving_size || (useServing ? 'per serving' : 'per 100g'),
    }
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return null
  }
}
