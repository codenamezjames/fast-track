import { useState, useCallback } from 'react'

interface UseManualEntryReturn<T> {
  showManualEntry: boolean
  manualValue: T
  openManualEntry: () => void
  closeManualEntry: () => void
  updateManualField: <K extends keyof T>(field: K, value: T[K]) => void
  setManualValue: React.Dispatch<React.SetStateAction<T>>
  reset: () => void
}

export function useManualEntry<T>(defaultValue: T): UseManualEntryReturn<T> {
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualValue, setManualValue] = useState<T>(defaultValue)

  const openManualEntry = useCallback(() => {
    setShowManualEntry(true)
  }, [])

  const closeManualEntry = useCallback(() => {
    setShowManualEntry(false)
    setManualValue(defaultValue)
  }, [defaultValue])

  const updateManualField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setManualValue((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const reset = useCallback(() => {
    setShowManualEntry(false)
    setManualValue(defaultValue)
  }, [defaultValue])

  return {
    showManualEntry,
    manualValue,
    openManualEntry,
    closeManualEntry,
    updateManualField,
    setManualValue,
    reset,
  }
}
