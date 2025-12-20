import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import FoodSearch from './FoodSearch'
import type { MealType, FoodItem } from '../../stores/mealsStore'
import { addToRecentFoods, type FoodSearchResult } from '../../services/foodDatabase'

interface AddMealModalProps {
  isOpen: boolean
  onClose: () => void
  mealType: MealType
  onSave: (foods: FoodItem[]) => void
}

const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

export default function AddMealModal({
  isOpen,
  onClose,
  mealType,
  onSave,
}: AddMealModalProps) {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualFood, setManualFood] = useState<FoodItem>({ name: '', calories: 0 })

  const handleFoodSearchSelect = (result: FoodSearchResult) => {
    const food: FoodItem = {
      name: result.brand ? `${result.name} (${result.brand})` : result.name,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      servingSize: result.servingSize,
    }
    setFoods([...foods, food])
    addToRecentFoods(result)
  }

  const handleRemoveFood = (index: number) => {
    setFoods(foods.filter((_, i) => i !== index))
  }

  const handleAddManualFood = () => {
    if (manualFood.name.trim() && manualFood.calories > 0) {
      setFoods([...foods, { ...manualFood }])
      setManualFood({ name: '', calories: 0 })
      setShowManualEntry(false)
    }
  }

  const handleManualChange = (field: keyof FoodItem, value: string | number) => {
    setManualFood({ ...manualFood, [field]: value })
  }

  const handleSave = () => {
    if (foods.length > 0) {
      onSave(foods)
      setFoods([])
      setShowManualEntry(false)
      setManualFood({ name: '', calories: 0 })
      onClose()
    }
  }

  const handleClose = () => {
    setFoods([])
    setShowManualEntry(false)
    setManualFood({ name: '', calories: 0 })
    onClose()
  }

  const totalCalories = foods.reduce((sum, f) => sum + (f.calories || 0), 0)
  const totalProtein = foods.reduce((sum, f) => sum + (f.protein || 0), 0)
  const totalCarbs = foods.reduce((sum, f) => sum + (f.carbs || 0), 0)
  const totalFat = foods.reduce((sum, f) => sum + (f.fat || 0), 0)

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add ${mealTypeLabels[mealType]}`}>
      <div className="space-y-4">
        {/* Food Search */}
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Search Food Database</label>
          <FoodSearch
            onSelect={handleFoodSearchSelect}
            placeholder="Search for foods..."
          />
        </div>

        {/* Added Foods List */}
        {foods.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm text-neutral-400">Added Foods</label>
            {foods.map((food, index) => (
              <div
                key={index}
                className="bg-neutral-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{food.name}</div>
                  <div className="text-sm text-neutral-400">
                    {food.calories} cal
                    {food.protein ? ` | P:${food.protein}g` : ''}
                    {food.carbs ? ` C:${food.carbs}g` : ''}
                    {food.fat ? ` F:${food.fat}g` : ''}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFood(index)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg ml-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Manual Entry Toggle */}
        {!showManualEntry ? (
          <button
            onClick={() => setShowManualEntry(true)}
            className="w-full py-3 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Food Manually
          </button>
        ) : (
          <div className="bg-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Manual Entry</span>
              <button
                onClick={() => setShowManualEntry(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <Input
              placeholder="Food name"
              value={manualFood.name}
              onChange={(e) => handleManualChange('name', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Calories *"
                value={manualFood.calories || ''}
                onChange={(e) =>
                  handleManualChange('calories', parseInt(e.target.value) || 0)
                }
              />
              <Input
                type="number"
                placeholder="Protein (g)"
                value={manualFood.protein || ''}
                onChange={(e) =>
                  handleManualChange('protein', parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Carbs (g)"
                value={manualFood.carbs || ''}
                onChange={(e) =>
                  handleManualChange('carbs', parseInt(e.target.value) || 0)
                }
              />
              <Input
                type="number"
                placeholder="Fat (g)"
                value={manualFood.fat || ''}
                onChange={(e) =>
                  handleManualChange('fat', parseInt(e.target.value) || 0)
                }
              />
            </div>

            <Button onClick={handleAddManualFood} className="w-full">
              Add to Meal
            </Button>
          </div>
        )}

        {/* Totals */}
        {foods.length > 0 && (
          <div className="py-3 border-t border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400">Total Calories</span>
              <span className="text-xl font-semibold">{totalCalories}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-400">
              <span>Protein: {totalProtein}g</span>
              <span>Carbs: {totalCarbs}g</span>
              <span>Fat: {totalFat}g</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={foods.length === 0}>
            Save Meal
          </Button>
        </div>
      </div>
    </Modal>
  )
}
