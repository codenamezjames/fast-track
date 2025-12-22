import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import IconButton from '../components/ui/IconButton'
import { useMealsStore, type MealType, type FoodItem, type Meal } from '../stores/mealsStore'
import { useSettingsStore } from '../stores/settingsStore'
import AddMealModal from '../components/meals/AddMealModal'
import EditMealModal from '../components/meals/EditMealModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import SuccessCelebration from '../components/ui/SuccessCelebration'

const mealTypes: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Breakfast' },
  { type: 'lunch', label: 'Lunch' },
  { type: 'dinner', label: 'Dinner' },
  { type: 'snack', label: 'Snacks' },
]

export default function Meals() {
  const {
    addMeal,
    updateMeal,
    deleteMeal,
    subscribeToMeals,
    cleanup,
    getMealsByType,
    getSelectedDateCalories,
    getSelectedDateMacros,
    selectedDate,
    setSelectedDate,
    isToday,
  } = useMealsStore()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast')
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    subscribeToMeals()

    // Re-subscribe when page becomes visible (handles overnight tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        subscribeToMeals()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cleanup()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const handleAddClick = (type: MealType) => {
    setSelectedMealType(type)
    setAddModalOpen(true)
  }

  const handleEditClick = (meal: Meal) => {
    setSelectedMeal(meal)
    setEditModalOpen(true)
  }

  const handleDeleteClick = (meal: Meal) => {
    setSelectedMeal(meal)
    setDeleteDialogOpen(true)
  }

  const handleSaveMeal = async (foods: FoodItem[]) => {
    await addMeal(selectedMealType, foods)
    setShowCelebration(true)
  }

  const handleUpdateMeal = async (id: string, foods: FoodItem[]) => {
    await updateMeal(id, foods)
  }

  const handleConfirmDelete = async () => {
    if (selectedMeal) {
      await deleteMeal(selectedMeal.id)
      setSelectedMeal(null)
    }
  }

  const { goals } = useSettingsStore()
  const calories = getSelectedDateCalories()
  const macros = getSelectedDateMacros()

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 1)
    setSelectedDate(prev)
  }

  const goToNextDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    setSelectedDate(next)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)

    if (dateOnly.getTime() === today.getTime()) return 'Today'
    if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="p-4 pb-24">
      {/* Date navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousDay}
          className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold">{formatDate(selectedDate)}</h1>
          {!isToday() && (
            <button
              onClick={goToToday}
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              Go to today
            </button>
          )}
        </div>
        <button
          onClick={goToNextDay}
          className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
          disabled={isToday()}
        >
          <ChevronRight size={24} className={isToday() ? 'text-neutral-600' : ''} />
        </button>
      </div>

      {/* Daily summary */}
      <div className="bg-neutral-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-neutral-400">Calories</span>
          <span className="text-sm text-neutral-400">{goals.calories} goal</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold">{calories}</span>
          <span className="text-neutral-400 mb-1">/ {goals.calories}</span>
        </div>
        <div className="mt-3 h-2 bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              calories > goals.calories ? 'bg-red-500' : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(100, (calories / goals.calories) * 100)}%` }}
          />
        </div>
      </div>

      {/* Macro summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-neutral-800 rounded-xl p-3">
          <div className="text-center mb-2">
            <div className="text-lg font-semibold text-blue-400">{macros.protein}g</div>
            <div className="text-xs text-neutral-400">/ {goals.protein}g Protein</div>
          </div>
          <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full"
              style={{ width: `${Math.min(100, (macros.protein / goals.protein) * 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-neutral-800 rounded-xl p-3">
          <div className="text-center mb-2">
            <div className="text-lg font-semibold text-green-400">{macros.carbs}g</div>
            <div className="text-xs text-neutral-400">/ {goals.carbs}g Carbs</div>
          </div>
          <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full"
              style={{ width: `${Math.min(100, (macros.carbs / goals.carbs) * 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-neutral-800 rounded-xl p-3">
          <div className="text-center mb-2">
            <div className="text-lg font-semibold text-yellow-400">{macros.fat}g</div>
            <div className="text-xs text-neutral-400">/ {goals.fat}g Fat</div>
          </div>
          <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${Math.min(100, (macros.fat / goals.fat) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Meal sections */}
      <div className="space-y-4">
        {mealTypes.map(({ type, label }) => {
          const typeMeals = getMealsByType(type)
          const typeCalories = typeMeals.reduce((sum, m) => sum + m.totalCalories, 0)

          return (
            <div key={type} className="bg-neutral-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-medium">{label}</span>
                  <span className="text-neutral-400 text-sm ml-2">
                    {typeCalories} cal
                  </span>
                </div>
                <IconButton
                  icon={<Plus size={18} />}
                  onClick={() => handleAddClick(type)}
                  variant="neutral"
                  className="hover:bg-orange-500"
                />
              </div>

              {typeMeals.length === 0 ? (
                <div className="text-neutral-500 text-sm">
                  No {label.toLowerCase()} logged yet
                </div>
              ) : (
                <div className="space-y-2">
                  {typeMeals.map((meal) => (
                    <div key={meal.id} className="bg-neutral-700/50 rounded-lg p-3">
                      <div className="space-y-2">
                        {meal.foods.map((food, index) => (
                          <div
                            key={`${meal.id}-${index}`}
                            className="flex items-center justify-between"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{food.name}</div>
                              <div className="text-xs text-neutral-400">
                                {food.protein ? `P: ${food.protein}g` : ''}
                                {food.carbs ? ` C: ${food.carbs}g` : ''}
                                {food.fat ? ` F: ${food.fat}g` : ''}
                              </div>
                            </div>
                            <span className="text-neutral-300 ml-2">{food.calories} cal</span>
                          </div>
                        ))}
                      </div>
                      {/* Meal actions */}
                      <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-neutral-600">
                        <IconButton
                          icon={<Pencil size={16} />}
                          onClick={() => handleEditClick(meal)}
                          variant="orange"
                          appearance="ghost"
                        />
                        <IconButton
                          icon={<Trash2 size={16} />}
                          onClick={() => handleDeleteClick(meal)}
                          variant="red"
                          appearance="ghost"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <AddMealModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        mealType={selectedMealType}
        onSave={handleSaveMeal}
      />

      <EditMealModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedMeal(null)
        }}
        meal={selectedMeal}
        onSave={handleUpdateMeal}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedMeal(null)
        }}
        title="Delete Meal"
        message={`Are you sure you want to delete this ${selectedMeal?.type || 'meal'}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        variant="danger"
      />

      {showCelebration && (
        <SuccessCelebration
          type="meal"
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  )
}
