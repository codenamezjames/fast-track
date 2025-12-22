import { useState, useCallback } from 'react'

interface UseListFormOptions<T> {
  initialItems?: T[]
  defaultItem: T
  minItems?: number
  validateItem?: (item: T) => boolean
}

interface UseListFormReturn<T> {
  items: T[]
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  addItem: (item?: T) => void
  removeItem: (index: number) => void
  updateItem: <K extends keyof T>(index: number, field: K, value: T[K]) => void
  resetItems: (newItems?: T[]) => void
  isValid: boolean
  getValidItems: () => T[]
}

export function useListForm<T>({
  initialItems = [],
  defaultItem,
  minItems = 0,
  validateItem,
}: UseListFormOptions<T>): UseListFormReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems)

  const addItem = useCallback(
    (item?: T) => {
      setItems((prev) => [...prev, item ?? { ...defaultItem }])
    },
    [defaultItem]
  )

  const removeItem = useCallback(
    (index: number) => {
      setItems((prev) => {
        if (prev.length <= minItems) return prev
        return prev.filter((_, i) => i !== index)
      })
    },
    [minItems]
  )

  const updateItem = useCallback(
    <K extends keyof T>(index: number, field: K, value: T[K]) => {
      setItems((prev) => {
        const updated = [...prev]
        updated[index] = { ...updated[index], [field]: value }
        return updated
      })
    },
    []
  )

  const resetItems = useCallback(
    (newItems?: T[]) => {
      setItems(newItems ?? initialItems)
    },
    [initialItems]
  )

  const getValidItems = useCallback(() => {
    if (!validateItem) return items
    return items.filter(validateItem)
  }, [items, validateItem])

  const isValid = getValidItems().length > 0

  return {
    items,
    setItems,
    addItem,
    removeItem,
    updateItem,
    resetItems,
    isValid,
    getValidItems,
  }
}
