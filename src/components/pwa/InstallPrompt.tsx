import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import Button from '../ui/Button'

interface InstallPromptProps {
  isInstallable: boolean
  onInstall: () => Promise<boolean>
}

export default function InstallPrompt({ isInstallable, onInstall }: InstallPromptProps) {
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)

  // Check if user previously dismissed (within last 7 days)
  useEffect(() => {
    const dismissedAt = localStorage.getItem('pwa-install-dismissed')
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - dismissedTime < sevenDays) {
        setDismissed(true)
      }
    }
  }, [])

  const handleInstall = async () => {
    setInstalling(true)
    const success = await onInstall()
    setInstalling(false)
    if (success) {
      setDismissed(true)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setDismissed(true)
  }

  if (!isInstallable || dismissed) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 animate-slide-up">
      <div className="bg-gradient-to-r from-primary/90 to-blue-600/90 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/10">
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Download size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white">Install Fast Track</h3>
            <p className="text-sm text-white/80 mt-0.5">
              Add to home screen for quick access and offline use
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="secondary"
            onClick={handleDismiss}
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Not now
          </Button>
          <Button
            onClick={handleInstall}
            disabled={installing}
            className="flex-1 bg-white text-primary hover:bg-white/90"
          >
            {installing ? 'Installing...' : 'Install'}
          </Button>
        </div>
      </div>
    </div>
  )
}
