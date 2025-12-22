import { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import IconButton from './IconButton'

interface ListItemCardProps {
  title: string
  subtitle?: string
  onRemove?: () => void
  removeDisabled?: boolean
  children?: ReactNode
}

export default function ListItemCard({
  title,
  subtitle,
  onRemove,
  removeDisabled = false,
  children,
}: ListItemCardProps) {
  return (
    <div className="bg-neutral-800 rounded-xl p-3 flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{title}</div>
        {subtitle && (
          <div className="text-sm text-neutral-400">{subtitle}</div>
        )}
        {children}
      </div>
      {onRemove && (
        <IconButton
          icon={<Trash2 size={18} />}
          onClick={onRemove}
          disabled={removeDisabled}
          variant="red"
          appearance="ghost"
          className="ml-2"
        />
      )}
    </div>
  )
}
