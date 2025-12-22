import { Plus } from 'lucide-react'

interface AddItemButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export default function AddItemButton({ label, onClick, disabled }: AddItemButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Plus size={18} />
      {label}
    </button>
  )
}
