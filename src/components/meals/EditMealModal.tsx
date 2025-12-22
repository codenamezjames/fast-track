import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import FoodSearch from './FoodSearch'
import ListItemCard from '../ui/ListItemCard'
import AddItemButton from '../ui/AddItemButton'
import ModalFooter from '../ui/ModalFooter'
import MacroTotals from './MacroTotals'
import { useManualEntry } from '../../hooks/useManualEntry'
import { calculateMacroTotals, formatMacroSummary } from '../../lib/macroUtils'
import type { Meal, FoodItem } from '../../stores/mealsStore'
import { addToRecentFoods, type FoodSearchResult } from '../../services/foodDatabase'

interface EditMealModalProps {
  isOpen: boolean
  onClose: () => void
  meal: Meal | null
  onSave: (id: string, foods: FoodItem[]) => void
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

const defaultManualFood: FoodItem = { name: '', calories: 0 }

export default function EditMealModal({
  isOpen,
  onClose,
  meal,
  onSave,
}: EditMealModalProps) {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const manual = useManualEntry<FoodItem>(defaultManualFood)

  // Initialize foods when meal changes
  useEffect(() => {
    if (meal) {
      setFoods([...meal.foods])
    }
  }, [meal])

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
    if (manual.manualValue.name.trim() && manual.manualValue.calories > 0) {
      setFoods([...foods, { ...manual.manualValue }])
      manual.closeManualEntry()
    }
  }

  const handleSave = () => {
    if (meal && foods.length > 0) {
      onSave(meal.id, foods)
      handleClose()
    }
  }

  const handleClose = () => {
    setFoods([])
    manual.reset()
    onClose()
  }

  const totals = calculateMacroTotals(foods)

  if (!meal) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Edit ${mealTypeLabels[meal.type]}`}>
      <div className="space-y-4">
        {/* Food Search */}
        <div>
          <div className="text-sm text-neutral-400 mb-2">Add More Foods</div>
          <FoodSearch
            onSelect={handleFoodSearchSelect}
            placeholder="Search for foods..."
          />
        </div>

        {/* Current Foods List */}
        {foods.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-neutral-400">Foods in This Meal</div>
            {foods.map((food, index) => (
              <ListItemCard
                key={`${food.name}-${index}`}
                title={food.name}
                subtitle={formatMacroSummary(food)}
                onRemove={() => handleRemoveFood(index)}
              />
            ))}
          </div>
        )}

        {/* Manual Entry Toggle */}
        {manual.showManualEntry ? (
          <div className="bg-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Manual Entry</span>
              <button
                onClick={manual.closeManualEntry}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <Input
              placeholder="Food name"
              value={manual.manualValue.name}
              onChange={(e) => manual.updateManualField('name', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Calories *"
                value={manual.manualValue.calories || ''}
                onChange={(e) =>
                  manual.updateManualField('calories', Number.parseInt(e.target.value) || 0)
                }
              />
              <Input
                type="number"
                placeholder="Protein (g)"
                value={manual.manualValue.protein || ''}
                onChange={(e) =>
                  manual.updateManualField('protein', Number.parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Carbs (g)"
                value={manual.manualValue.carbs || ''}
                onChange={(e) =>
                  manual.updateManualField('carbs', Number.parseInt(e.target.value) || 0)
                }
              />
              <Input
                type="number"
                placeholder="Fat (g)"
                value={manual.manualValue.fat || ''}
                onChange={(e) =>
                  manual.updateManualField('fat', Number.parseInt(e.target.value) || 0)
                }
              />
            </div>

            <Button onClick={handleAddManualFood} className="w-full">
              Add to Meal
            </Button>
          </div>
        ) : (
          <AddItemButton
            label="Add Food Manually"
            onClick={manual.openManualEntry}
          />
        )}

        {/* Totals */}
        {foods.length > 0 && (
          <MacroTotals
            calories={totals.calories}
            protein={totals.protein}
            carbs={totals.carbs}
            fat={totals.fat}
          />
        )}

        {/* Actions */}
        <ModalFooter
          onCancel={handleClose}
          onSave={handleSave}
          saveLabel="Save Changes"
          saveDisabled={foods.length === 0}
        />
      </div>
    </Modal>
  )
}
