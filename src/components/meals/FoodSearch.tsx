import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X, Clock, ScanBarcode } from 'lucide-react'
import {
  searchFoods,
  getRecentFoods,
  lookupBarcode,
  type FoodSearchResult,
} from '../../services/foodDatabase'
import BarcodeScanner from './BarcodeScanner'

interface FoodSearchProps {
  onSelect: (food: FoodSearchResult) => void
  placeholder?: string
}

export default function FoodSearch({ onSelect, placeholder = 'Search foods...' }: FoodSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodSearchResult[]>([])
  const [recentFoods, setRecentFoods] = useState<FoodSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerLoading, setScannerLoading] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load recent foods on mount
  useEffect(() => {
    setRecentFoods(getRecentFoods())
  }, [])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const foods = await searchFoods(query)
      setResults(foods)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (food: FoodSearchResult) => {
    onSelect(food)
    setQuery('')
    setResults([])
    setShowDropdown(false)
    // Refresh recent foods
    setTimeout(() => setRecentFoods(getRecentFoods()), 100)
  }

  const handleFocus = () => {
    setShowDropdown(true)
  }

  const handleBarcodeScan = async (barcode: string) => {
    setScannerOpen(false)
    setScannerLoading(true)
    setScannerError(null)

    try {
      const food = await lookupBarcode(barcode)
      if (food) {
        handleSelect(food)
      } else {
        setScannerError('Product not found. Try searching manually.')
      }
    } catch {
      setScannerError('Failed to look up product. Please try again.')
    } finally {
      setScannerLoading(false)
    }
  }

  const showRecent = !query.trim() && recentFoods.length > 0

  return (
    <div className="relative">
      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScan}
      />

      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full bg-neutral-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {loading && (
            <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 animate-spin" />
          )}
          {!loading && query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Barcode Scan Button */}
        <button
          onClick={() => setScannerOpen(true)}
          disabled={scannerLoading}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white rounded-xl px-4 py-3 transition-colors flex items-center justify-center"
          title="Scan barcode"
        >
          {scannerLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <ScanBarcode size={20} />
          )}
        </button>
      </div>

      {/* Scanner Error Message */}
      {scannerError && (
        <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center justify-between">
          <span>{scannerError}</span>
          <button onClick={() => setScannerError(null)} className="text-red-300 hover:text-red-200">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && (showRecent || results.length > 0) && (
        <div
          ref={dropdownRef}
          className="relative z-50 w-full mt-3 bg-neutral-700 rounded-xl shadow-xl border border-neutral-600 max-h-60 overflow-y-auto"
        >
          {/* Recent Foods */}
          {showRecent && (
            <div className="p-3">
              <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                <Clock size={14} />
                <span>Recent</span>
              </div>
              <div className="space-y-1">
                {recentFoods.slice(0, 5).map((food) => (
                  <FoodResultItem
                    key={`recent-${food.id}`}
                    food={food}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div className="p-3">
              {showRecent && (
                <div className="text-neutral-400 text-sm mb-2">Search Results</div>
              )}
              <div className="space-y-1">
                {results.map((food) => (
                  <FoodResultItem
                    key={food.id}
                    food={food}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {query.trim() && !loading && results.length === 0 && (
            <div className="p-4 text-center text-neutral-400">
              No results found. Try a different search or add manually.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface FoodResultItemProps {
  food: FoodSearchResult
  onSelect: (food: FoodSearchResult) => void
}

function FoodResultItem({ food, onSelect }: FoodResultItemProps) {
  return (
    <button
      onClick={() => onSelect(food)}
      className="w-full text-left p-2 rounded-lg hover:bg-neutral-700 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{food.name}</div>
          {food.brand && (
            <div className="text-sm text-neutral-400 truncate">{food.brand}</div>
          )}
          <div className="text-xs text-neutral-500">{food.servingSize}</div>
        </div>
        <div className="text-right ml-3">
          <div className="font-semibold text-primary">{food.calories} cal</div>
          <div className="text-xs text-neutral-400">
            P:{food.protein}g C:{food.carbs}g F:{food.fat}g
          </div>
        </div>
      </div>
    </button>
  )
}
