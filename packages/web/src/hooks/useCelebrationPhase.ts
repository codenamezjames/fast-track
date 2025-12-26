import { useState, useEffect } from 'react'

export type CelebrationPhase = 'enter' | 'show' | 'exit'

interface UseCelebrationPhaseOptions {
  enterDelay?: number
  showDuration?: number
  exitDuration?: number
  onComplete?: () => void
}

export function useCelebrationPhase({
  enterDelay = 50,
  showDuration = 2000,
  exitDuration = 300,
  onComplete,
}: UseCelebrationPhaseOptions = {}) {
  const [phase, setPhase] = useState<CelebrationPhase>('enter')

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('show'), enterDelay)
    const exitTimer = setTimeout(
      () => setPhase('exit'),
      enterDelay + showDuration
    )
    const completeTimer = setTimeout(() => {
      onComplete?.()
    }, enterDelay + showDuration + exitDuration)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
      clearTimeout(completeTimer)
    }
  }, [enterDelay, showDuration, exitDuration, onComplete])

  return phase
}
