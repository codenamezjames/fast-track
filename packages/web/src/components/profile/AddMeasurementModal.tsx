import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import ModalFooter from '../ui/ModalFooter'

interface AddMeasurementModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { weight?: number; height?: number; bodyFat?: number }) => void
  currentHeight?: number | null
}

export default function AddMeasurementModal({
  isOpen,
  onClose,
  onSave,
  currentHeight,
}: AddMeasurementModalProps) {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState(currentHeight?.toString() || '')
  const [bodyFat, setBodyFat] = useState('')

  const handleSave = () => {
    const data: { weight?: number; height?: number; bodyFat?: number } = {}

    if (weight) data.weight = parseFloat(weight)
    if (height) data.height = parseFloat(height)
    if (bodyFat) data.bodyFat = parseFloat(bodyFat)

    if (Object.keys(data).length > 0) {
      onSave(data)
      setWeight('')
      setBodyFat('')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Measurement">
      <div className="space-y-4">
        <Input
          label="Weight (kg)"
          type="number"
          step="0.1"
          placeholder="e.g., 75.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <Input
          label="Height (cm)"
          type="number"
          placeholder="e.g., 175"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />

        <Input
          label="Body Fat % (optional)"
          type="number"
          step="0.1"
          placeholder="e.g., 15.5"
          value={bodyFat}
          onChange={(e) => setBodyFat(e.target.value)}
        />

        <div className="pt-4">
          <ModalFooter
            onCancel={onClose}
            onSave={handleSave}
          />
        </div>
      </div>
    </Modal>
  )
}
