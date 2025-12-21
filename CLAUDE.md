# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fast Track is a personal fitness and lifestyle tracking PWA built with React, TypeScript, and Firebase. Features include meal logging with AI food analysis, workout tracking with custom routines, GPS activity tracking, and body measurements/BMI tracking.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State**: Zustand
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth, Firestore)
- **Routing**: React Router v6 (HashRouter for GitHub Pages)
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

## Architecture

### Data Flow
Components -> Zustand stores -> Firebase Firestore

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

- `src/pages/` - Page components (Dashboard, Meals, Workouts, Activity, Profile, Login)
- `src/components/` - Reusable React components
  - `src/components/layout/` - Layout components (MainLayout, BottomNav)
- `src/stores/` - Zustand stores
- `src/lib/` - Utilities, Firebase config
- `src/hooks/` - Custom React hooks
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
- `#/profile` - Profile, measurements, settings
- `#/login` - Authentication

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_GOOGLE_CLOUD_VISION_API_KEY=your-vision-api-key
```

## Development Notes

- Personal use app - single user, simplified auth flow
- PWA with offline support via Firestore persistence
- Mobile-first design with bottom navigation
- HashRouter used for GitHub Pages compatibility
- All pages have placeholder content ready for feature implementation

## GitHub Pages Deployment

The app is automatically deployed to GitHub Pages via GitHub Actions when pushing to the `main` branch. Make sure to configure the Firebase secrets in your repository settings.

## Feature Implementation Status

- [x] Phase 1: Foundation (scaffold, Firebase, auth, navigation, dark theme)
- [x] Phase 2: Meals (food tracking, OpenFoodFacts, barcode scanning)
- [x] Phase 3: Workouts (strength training, custom routines, workout logs)
- [x] Phase 4: Measurements (weight, height, BMI, daily goals)
- [x] Phase 5: Activity (timer-based tracking, manual distance entry)
- [x] Phase 6: Polish (PWA install prompt, enhanced offline, Capacitor + Health integration)
