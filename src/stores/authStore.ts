import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  initialized: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      await signInWithEmailAndPassword(auth, email, password)
      set({ loading: false })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      set({ loading: false, error: message })
      return false
    }
  },

  register: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      set({ loading: false })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      set({ loading: false, error: message })
      return false
    }
  },

  logout: async () => {
    await signOut(auth)
  },

  clearError: () => set({ error: null }),
}))

// Listen to auth state changes
onAuthStateChanged(auth, (user) => {
  useAuthStore.setState({ user, initialized: true })
})
