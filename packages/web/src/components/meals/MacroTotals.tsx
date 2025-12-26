interface MacroTotalsProps {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function MacroTotals({ calories, protein, carbs, fat }: MacroTotalsProps) {
  return (
    <div className="py-3 border-t border-neutral-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-neutral-400">Total Calories</span>
        <span className="text-xl font-semibold">{calories}</span>
      </div>
      <div className="flex justify-between text-sm text-neutral-400">
        <span>Protein: {protein}g</span>
        <span>Carbs: {carbs}g</span>
        <span>Fat: {fat}g</span>
      </div>
    </div>
  )
}
