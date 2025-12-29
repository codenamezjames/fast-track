import { HashRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Fasting from './pages/Fasting'
import Meals from './pages/Meals'
import Workouts from './pages/Workouts'
import Activity from './pages/Activity'
import Profile from './pages/Profile'
import Streaks from './pages/Streaks'
import Login from './pages/Login'
import { InstallPrompt, OfflineIndicator, UpdatePrompt } from './components/pwa'
import { usePWA } from './hooks/usePWA'
import './index.css'

export default function App() {
  const {
    isOnline,
    isInstallable,
    needRefresh,
    installApp,
    updateApp,
    dismissUpdate,
  } = usePWA()

  return (
    <HashRouter>
      <OfflineIndicator isOnline={isOnline} />
      <UpdatePrompt
        needRefresh={needRefresh}
        onUpdate={updateApp}
        onDismiss={dismissUpdate}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/streaks" element={<Streaks />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fasting" element={<Fasting />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
      <InstallPrompt isInstallable={isInstallable} onInstall={installApp} />
    </HashRouter>
  )
}
