import { FASTING_PRESETS, type FastingPreset } from '../../stores/fastingStore'

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
          <button
            key={preset.name}
            onClick={() => onSelect(preset)}
            disabled={disabled}
            className={`py-3 px-2 rounded-xl text-center transition-all ${
              isSelected
                ? 'bg-primary text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="font-semibold">{preset.name}</div>
            <div className="text-xs opacity-75">
              {preset.fastHours}h fast
            </div>
          </button>
        )
      })}
    </div>
  )
}
