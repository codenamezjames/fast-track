import { useState } from 'react'
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

const defaultManualFood: FoodItem = { name: '', calories: 0 }

export default function AddMealModal({
  isOpen,
  onClose,
  mealType,
  onSave,
}: AddMealModalProps) {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const manual = useManualEntry<FoodItem>(defaultManualFood)

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
    if (foods.length > 0) {
      onSave(foods)
      setFoods([])
      manual.reset()
      onClose()
    }
  }

  const handleClose = () => {
    setFoods([])
    manual.reset()
    onClose()
  }

  const totals = calculateMacroTotals(foods)

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
              <ListItemCard
                key={index}
                title={food.name}
                subtitle={formatMacroSummary(food)}
                onRemove={() => handleRemoveFood(index)}
              />
            ))}
          </div>
        )}

        {/* Manual Entry Toggle */}
        {!manual.showManualEntry ? (
          <AddItemButton
            label="Add Food Manually"
            onClick={manual.openManualEntry}
          />
        ) : (
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
                  manual.updateManualField('calories', parseInt(e.target.value) || 0)
                }
              />
              <Input
                type="number"
                placeholder="Protein (g)"
                value={manual.manualValue.protein || ''}
                onChange={(e) =>
                  manual.updateManualField('protein', parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Carbs (g)"
                value={manual.manualValue.carbs || ''}
                onChange={(e) =>
                  manual.updateManualField('carbs', parseInt(e.target.value) || 0)
                }
              />
              <Input
                type="number"
                placeholder="Fat (g)"
                value={manual.manualValue.fat || ''}
                onChange={(e) =>
                  manual.updateManualField('fat', parseInt(e.target.value) || 0)
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
          saveLabel="Save Meal"
          saveDisabled={foods.length === 0}
        />
      </div>
    </Modal>
  )
}
