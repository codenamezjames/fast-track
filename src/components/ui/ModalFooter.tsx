import Button from './Button'

interface ModalFooterProps {
  onCancel: () => void
  onSave: () => void
  cancelLabel?: string
  saveLabel?: string
  saveDisabled?: boolean
  loading?: boolean
}

export default function ModalFooter({
  onCancel,
  onSave,
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  saveDisabled = false,
  loading = false,
}: ModalFooterProps) {
  return (
    <div className="flex gap-3">
      <Button
        variant="secondary"
        onClick={onCancel}
        className="flex-1"
        disabled={loading}
      >
        {cancelLabel}
      </Button>
      <Button
        onClick={onSave}
        className="flex-1"
        disabled={saveDisabled || loading}
      >
        {saveLabel}
      </Button>
    </div>
  )
}
