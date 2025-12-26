# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fast Track is a personal fitness and lifestyle tracking PWA built with React, TypeScript, and a custom Express/MongoDB backend. Features include meal logging with AI food analysis, workout tracking with custom routines, GPS activity tracking, and body measurements/BMI tracking.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **State**: Zustand
- **Styling**: Tailwind CSS v4
- **Backend**: Express.js + MongoDB (JWT auth)
- **Routing**: React Router v7 (HashRouter for GitHub Pages)
- **Icons**: Lucide React
- **Food Database**: OpenFoodFacts API
- **AI Food Analysis**: Google Cloud Vision API
- **PWA**: vite-plugin-pwa
- **Hosting**: GitHub Pages
- **Theme**: Dark mode default

## Common Commands

```bash
# Development (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## Project Structure

This is a monorepo using npm workspaces:

```
fast-track/
├── packages/
│   ├── api/          # Express.js backend (MongoDB, JWT auth)
│   └── web/          # React frontend (Vite, Tailwind)
├── docker-compose.yml
└── package.json      # Workspace root
```

### API Package (`packages/api`)
- Express.js REST API
- MongoDB with Mongoose ODM
- JWT authentication (access + refresh tokens)
- Routes: auth, meals, routines, workout-logs, activities, measurements, fasts, streaks

### Web Package (`packages/web`)
- React 19 + TypeScript + Vite
- Zustand state management
- Tailwind CSS v4
- PWA with offline support

## Architecture

### Data Flow
Components -> Zustand stores -> REST API -> MongoDB

### Stores
- `src/stores/authStore.ts` - Authentication state and actions
- `src/stores/mealsStore.ts` - Meal logging and calorie tracking
- `src/stores/workoutsStore.ts` - Workout routines and exercise logs
- `src/stores/measurementsStore.ts` - Weight, height, BMI tracking
- `src/stores/activityStore.ts` - Activity tracking (run, walk, bike)
- `src/stores/fastingStore.ts` - Intermittent fasting timer
- `src/stores/streakStore.ts` - Duolingo-style streak system
- `src/stores/settingsStore.ts` - User goals and preferences

## Key Directories

- `src/pages/` - Page components (Dashboard, Meals, Workouts, Activity, Fasting, Profile, Login)
- `src/components/` - Reusable React components
  - `src/components/layout/` - Layout components (MainLayout, BottomNav)
  - `src/components/ui/` - Shared UI components (Button, IconButton, Modal, Input, etc.)
  - `src/components/meals/` - Meal-related components (AddMealModal, FoodSearch, MacroTotals)
  - `src/components/workouts/` - Workout-related components (CreateRoutineModal, etc.)
  - `src/components/fasting/` - Fasting-related components (FastingPresets, FastingTimeline)
  - `src/components/streak/` - Streak and celebration components
  - `src/components/dashboard/` - Dashboard widgets
- `src/stores/` - Zustand stores
- `src/lib/` - Utilities (dateUtils, macroUtils, api client)
- `src/hooks/` - Custom React hooks (useListForm, useManualEntry, useCelebrationPhase)
- `public/` - Static assets, PWA icons

## Conventions

### Component Style
- Functional components with TypeScript
- Props with TypeScript interfaces
- CSS classes via Tailwind

### Styling
- Tailwind CSS v4 with dark mode default
- Theme colors defined in `src/index.css`:
  - primary (#1976d2)
  - secondary (#26a69a)
  - accent (#9c27b0)

### Routes Structure (HashRouter)
- `#/` - Dashboard
- `#/meals` - Meal tracking
- `#/workouts` - Workout tracking
- `#/activity` - GPS activity tracking
- `#/fasting` - Intermittent fasting timer
- `#/profile` - Profile, measurements, settings
- `#/login` - Authentication

## Environment Variables

### Web Package (`packages/web/.env.local`)
```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLOUD_VISION_API_KEY=your-vision-api-key
```

### API Package (`packages/api/.env`)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fast-track
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

## Development Notes

- Personal use app - single user, simplified auth flow
- PWA with offline support
- Mobile-first design with bottom navigation
- HashRouter used for GitHub Pages compatibility
- Monorepo structure with npm workspaces

## Deployment

### Local Development (Docker)
```bash
npm run up        # Start all services (MongoDB, API, Web)
npm run down      # Stop all services
npm run logs      # View logs
npm run rebuild   # Rebuild and restart
```

### GitHub Pages
The web frontend can be deployed to GitHub Pages via GitHub Actions. Configure `API_URL` secret in repository settings to point to your hosted API.

## Feature Implementation Status

- [x] Phase 1: Foundation (scaffold, auth, navigation, dark theme)
- [x] Phase 2: Meals (food tracking, OpenFoodFacts, barcode scanning)
- [x] Phase 3: Workouts (strength training, custom routines, workout logs)
- [x] Phase 4: Measurements (weight, height, BMI, daily goals)
- [x] Phase 5: Activity (timer-based tracking, manual distance entry)
- [x] Phase 6: Polish (PWA install prompt, enhanced offline)
- [x] Phase 7: Backend Migration (Express/MongoDB API, JWT auth, Docker)

## Animation System

The app includes a comprehensive animation library defined in `src/index.css`:
- Page transitions (`PageTransition` component)
- List item animations (`AnimatedList` component)
- Success celebrations (`SuccessCelebration` component)
- Button micro-interactions (hover scale 1.02x, active press 0.98x)
- Utility animations (float, wiggle, pulse)

## Shared Utilities

### Date & Time (`src/lib/dateUtils.ts`)
- `getStartOfDay(date?)` - Get midnight of given date
- `getEndOfDay(date?)` - Get 23:59:59 of given date
- `getDateString(date?)` - Format as YYYY-MM-DD
- `getWeekDates()` - Get last 7 days as date strings
- `formatTimeAgo(date)` - Format as "Xd ago", "Xh ago", or "Just now"
- `formatDuration(minutes)` - Format as "Xh Xm" or "Xm"
- `formatElapsedTime(ms)` - Format as "H:MM:SS" or "M:SS"

### Macro Calculations (`src/lib/macroUtils.ts`)
- `calculateMacroTotals(foods[])` - Sum calories, protein, carbs, fat

## Custom Hooks

- `useListForm` - Generic list management for modals (add, remove, update items)
- `useManualEntry` - Toggle-based manual entry form state
- `useCelebrationPhase` - Phase-based animation state (enter → show → exit)

## UI Component Library

### Buttons (`src/components/ui/`)
- `Button` - Standard button with variants (primary, secondary, danger, ghost, purple, orange, red, blue, dashed)
- `IconButton` - Icon-only button with solid/ghost appearances and section colors
- `SelectionButton` - Toggle button for selection groups

### Modal Components
- `Modal` - Base modal wrapper
- `ModalFooter` - Standard Cancel/Save button pair
- `ListItemCard` - Item card with remove button
- `AddItemButton` - Dashed border "Add X" button

### Section Color Scheme
| Section | Color | Hex |
|---------|-------|-----|
| Meals | Orange | `#f97316` |
| Workouts | Red | `#ef4444` |
| Activity | Blue | `#3b82f6` |
| Fasting | Purple | `#8b5cf6` |
| Profile/General | Primary | `#1976d2` |
