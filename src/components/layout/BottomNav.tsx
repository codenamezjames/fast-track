import { NavLink } from 'react-router-dom'
import { Home, Timer, Utensils, Dumbbell, User } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/fasting', icon: Timer, label: 'Fasting' },
  { to: '/meals', icon: Utensils, label: 'Meals' },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 ${
                isActive ? 'text-primary' : 'text-neutral-400'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-xs">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
