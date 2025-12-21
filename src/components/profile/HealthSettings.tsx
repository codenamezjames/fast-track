import { useEffect } from 'react'
import {
  Heart,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { useHealthStore, type SyncSettings } from '../../stores/healthStore'
import Button from '../ui/Button'

const syncOptions: { key: keyof SyncSettings; label: string; description: string }[] = [
  { key: 'weight', label: 'Weight', description: 'Sync weight measurements' },
  { key: 'height', label: 'Height', description: 'Sync height' },
  { key: 'bodyFat', label: 'Body Fat %', description: 'Sync body fat percentage' },
  { key: 'activities', label: 'Activities', description: 'Sync runs, walks, and bike rides' },
  { key: 'workouts', label: 'Workouts', description: 'Sync strength training sessions' },
]

export default function HealthSettings() {
  const [expanded, setExpanded] = useState(false)

  const {
    isAvailable,
    isChecking,
    hasPermissions,
    permissionsChecked,
    syncEnabled,
    syncSettings,
    lastSyncDate,
    isSyncing,
    syncError,
    checkAvailability,
    requestPermissions,
    setSyncEnabled,
    updateSyncSettings,
    openHealthApp,
  } = useHealthStore()

  // Check availability on mount
  useEffect(() => {
    checkAvailability()
  }, [checkAvailability])

  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const handleToggleSync = async () => {
    if (!hasPermissions && !syncEnabled) {
      const granted = await requestPermissions()
      if (granted) {
        setSyncEnabled(true)
      }
    } else {
      setSyncEnabled(!syncEnabled)
    }
  }

  const handleToggleSetting = (key: keyof SyncSettings) => {
    updateSyncSettings({ [key]: !syncSettings[key] })
  }

  // Not available (web or no health app)
  if (!isChecking && !isAvailable) {
    return (
      <div className="bg-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="bg-neutral-700 p-3 rounded-xl">
            <Heart size={20} className="text-neutral-500" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-neutral-400">Health App Sync</div>
            <div className="text-sm text-neutral-500">
              {isChecking ? 'Checking...' : 'Not available on this device'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Main toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-neutral-800 rounded-xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${syncEnabled ? 'bg-red-500/20' : 'bg-neutral-700'}`}>
            <Heart size={20} className={syncEnabled ? 'text-red-400' : 'text-neutral-400'} />
          </div>
          <div className="text-left">
            <div className="font-medium">Health App Sync</div>
            <div className="text-sm text-neutral-400">
              {syncEnabled ? (
                <span className="text-green-400">Connected</span>
              ) : (
                'Tap to connect'
              )}
              {lastSyncDate && syncEnabled && (
                <span className="text-neutral-500"> · Last sync {formatLastSync(lastSyncDate)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSyncing && <Loader2 size={16} className="animate-spin text-neutral-400" />}
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Expanded settings */}
      {expanded && (
        <div className="bg-neutral-800 rounded-xl p-4 space-y-4">
          {/* Connection status */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-700">
            <div className="flex items-center gap-2">
              {hasPermissions ? (
                <>
                  <CheckCircle2 size={16} className="text-green-400" />
                  <span className="text-sm text-green-400">Permissions granted</span>
                </>
              ) : permissionsChecked ? (
                <>
                  <XCircle size={16} className="text-amber-400" />
                  <span className="text-sm text-amber-400">Permissions needed</span>
                </>
              ) : (
                <span className="text-sm text-neutral-400">Checking permissions...</span>
              )}
            </div>
            <button
              onClick={openHealthApp}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
            >
              <span>Open Health</span>
              <ExternalLink size={14} />
            </button>
          </div>

          {/* Enable/Disable sync */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Sync</div>
              <div className="text-sm text-neutral-400">
                Sync data with Apple Health / Health Connect
              </div>
            </div>
            <button
              onClick={handleToggleSync}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                syncEnabled ? 'bg-green-500' : 'bg-neutral-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  syncEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Sync options */}
          {syncEnabled && (
            <div className="space-y-3 pt-3 border-t border-neutral-700">
              <div className="text-sm text-neutral-400">Data to sync:</div>
              {syncOptions.map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-neutral-500">{description}</div>
                  </div>
                  <button
                    onClick={() => handleToggleSetting(key)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      syncSettings[key] ? 'bg-primary' : 'bg-neutral-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        syncSettings[key] ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Error message */}
          {syncError && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {syncError}
            </div>
          )}

          {/* Manual sync button */}
          {syncEnabled && hasPermissions && (
            <Button
              variant="secondary"
              onClick={() => {
                // Trigger a manual check/sync
                checkAvailability()
              }}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Check Connection'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
