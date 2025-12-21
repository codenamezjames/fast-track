import { RefreshCw, X } from 'lucide-react'
import Button from '../ui/Button'

interface UpdatePromptProps {
  needRefresh: boolean
  onUpdate: () => void
  onDismiss: () => void
}

export default function UpdatePrompt({ needRefresh, onUpdate, onDismiss }: UpdatePromptProps) {
  if (!needRefresh) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <div className="bg-green-500/90 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/10">
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <RefreshCw size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white">Update Available</h3>
            <p className="text-sm text-white/80 mt-0.5">
              A new version is ready. Refresh to update.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="secondary"
            onClick={onDismiss}
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Later
          </Button>
          <Button
            onClick={onUpdate}
            className="flex-1 bg-white text-green-600 hover:bg-white/90"
          >
            Refresh Now
          </Button>
        </div>
      </div>
    </div>
  )
}
