import { useEffect, useRef, useState } from 'react'
import { X, Camera, AlertCircle, Loader2 } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import Button from '../ui/Button'

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (barcode: string) => void
}

type ScannerState = 'initializing' | 'scanning' | 'error'

export default function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerProps) {
  const [state, setState] = useState<ScannerState>('initializing')
  const [error, setError] = useState<string>('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    let mounted = true
    const scannerId = 'barcode-scanner'

    const startScanner = async () => {
      try {
        setState('initializing')
        setError('')

        // Wait for DOM element to be ready with dimensions
        await new Promise((resolve) => setTimeout(resolve, 150))

        // Verify element exists
        const element = document.getElementById(scannerId)
        if (!element) {
          throw new Error('Scanner element not found')
        }

        // Create scanner instance
        const html5QrCode = new Html5Qrcode(scannerId)
        scannerRef.current = html5QrCode

        // Use facingMode for better mobile support
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        }

        // Try back camera first (environment), fall back to any camera
        try {
          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              if (mounted) {
                html5QrCode.stop().catch(console.error)
                onScan(decodedText)
              }
            },
            () => {
              // Ignore scan failures (silent)
            }
          )
        } catch {
          // If environment camera fails, try user-facing camera
          await html5QrCode.start(
            { facingMode: 'user' },
            config,
            (decodedText) => {
              if (mounted) {
                html5QrCode.stop().catch(console.error)
                onScan(decodedText)
              }
            },
            () => {
              // Ignore scan failures (silent)
            }
          )
        }

        if (mounted) {
          setState('scanning')
        }
      } catch (err) {
        console.error('Scanner error:', err)
        if (mounted) {
          setState('error')
          const errorMsg = err instanceof Error ? err.message : String(err)

          if (errorMsg.includes('Permission') || errorMsg.includes('NotAllowed')) {
            setError('Camera permission denied. Please allow camera access in your browser settings.')
          } else if (errorMsg.includes('NotFound') || errorMsg.includes('No camera')) {
            setError('No camera found on this device.')
          } else if (errorMsg.includes('NotSupported') || errorMsg.includes('insecure')) {
            setError('Camera requires HTTPS. Please access via https://.')
          } else if (errorMsg.includes('NotReadable') || errorMsg.includes('in use')) {
            setError('Camera is in use by another app. Please close other apps using the camera.')
          } else {
            setError(`Camera error: ${errorMsg}`)
          }
        }
      }
    }

    startScanner()

    return () => {
      mounted = false
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {
          // Ignore stop errors on unmount
        })
        scannerRef.current = null
      }
    }
  }, [isOpen, onScan])

  const handleClose = () => {
    if (scannerRef.current) {
      const scanner = scannerRef.current
      // Check if scanner is running before stopping
      if (scanner.isScanning) {
        scanner.stop().catch(() => {
          // Ignore stop errors
        })
      }
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Scan Barcode</h2>
        <button
          onClick={handleClose}
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scanner container */}
      <div className="w-full max-w-md px-4" ref={containerRef}>
        {/* Scanner viewport - always rendered but visibility controlled */}
        <div className="relative">
          <div
            id="barcode-scanner"
            className={`rounded-xl overflow-hidden ${state === 'scanning' ? 'opacity-100' : 'opacity-0'}`}
            style={{ minHeight: state === 'initializing' ? '200px' : undefined }}
          />

          {/* Overlay for initializing state */}
          {state === 'initializing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 size={48} className="text-orange-400 animate-spin mb-4" />
              <p className="text-neutral-400">Starting camera...</p>
            </div>
          )}

          {/* Overlay for error state */}
          {state === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <p className="text-neutral-300 mb-6">{error}</p>
              <Button variant="orange" onClick={handleClose}>
                Close
              </Button>
            </div>
          )}
        </div>

        {state === 'scanning' && (
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-neutral-400 mb-2">
              <Camera size={18} />
              <span>Point camera at barcode</span>
            </div>
            <p className="text-xs text-neutral-500">
              Works with most food product barcodes
            </p>
          </div>
        )}
      </div>

      {/* Cancel button */}
      {state === 'scanning' && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
