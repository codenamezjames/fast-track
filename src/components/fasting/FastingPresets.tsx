import { FASTING_PRESETS, type FastingPreset } from '../../stores/fastingStore'
import SelectionButton from '../ui/SelectionButton'

interface FastingPresetsProps {
  selected: FastingPreset
  onSelect: (preset: FastingPreset) => void
  disabled?: boolean
}

export default function FastingPresets({ selected, onSelect, disabled }: FastingPresetsProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {FASTING_PRESETS.map((preset) => {
        const isSelected = selected.name === preset.name

        return (
          <SelectionButton
            key={preset.name}
            selected={isSelected}
            onClick={() => onSelect(preset)}
            disabled={disabled}
            variant="purple"
            className="flex-none"
          >
            <div className="font-semibold">{preset.name}</div>
            <div className="text-xs opacity-75">
              {preset.fastHours}h fast
            </div>
          </SelectionButton>
        )
      })}
    </div>
  )
}
