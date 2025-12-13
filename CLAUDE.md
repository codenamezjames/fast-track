# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FastTrack is a mobile-first calorie and intermittent fasting tracker built with Vue 3, Quasar Framework, and Appwrite backend. The application features offline-first architecture with comprehensive testing support.

**Working Directory**: All commands run from `frontend/` directory.

## Key Technologies

- **Frontend**: Vue 3 with Composition API only (NO TypeScript)
- **UI Framework**: Quasar Framework (mobile-first responsive design)
- **State Management**: Pinia stores
- **Backend**: Appwrite (auth, database, real-time) with offline fallback
- **Offline Storage**: IndexedDB via Dexie.js
- **Build**: Vite via Quasar CLI
- **Testing**: Vitest with Vue Test Utils (happy-dom environment)
- **Mobile**: Capacitor for native apps

## Development Commands

All commands run from `frontend/` directory:

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run build:pwa              # Build PWA version
npm run build:analyze          # Analyze bundle size

# Testing
npm test                       # Run tests in watch mode
npm run test:run               # Run all tests once
npm run test:coverage          # Run tests with coverage
npm run test:ci                # Run tests for CI/CD (JSON output)

# Code Quality
npm run lint                   # Lint code
npm run format                 # Format code
npm run quality:check          # Run lint + format check + test:run
npm run quality:fix            # Fix linting and formatting
```

### Testing Specific Files

```bash
# Run specific test file
npx vitest run test/stores/calories.test.js

# Run tests matching pattern
npx vitest run --grep "auth"
```

## Architecture Overview

### Project Structure

```
frontend/
├── src/
│   ├── components/          # Vue components (base/, optimized/, settings/, meals/, weight/)
│   ├── composables/         # Reusable logic (useChartDefaults, useDataExport, useErrorHandling)
│   ├── stores/              # Pinia stores (auth, calories, fasting, weight, theme, notifications)
│   ├── services/            # API and business logic (appwrite, auth, offline, sync, notifications)
│   ├── repositories/        # Data access layer (BaseRepository, MealsRepository)
│   ├── pages/               # Route components (Login, Calories, Fasting, Analytics, Settings)
│   ├── layouts/             # Layout components (MainLayout with navigation drawer)
│   ├── router/              # Vue Router with auth guards
│   └── utils/               # Error handling, constants, performance utilities
└── test/                    # Test suite (stores/, components/, services/, integration/)
```

### Stores

- **auth.js** - Authentication state and Appwrite integration
- **calories.js** - Meal tracking with offline-first storage
- **fasting.js** - Intermittent fasting timers and schedules
- **weight.js** - Weight tracking with unit conversion (lb/kg)
- **theme.js** - Theme preferences management
- **notifications.js** - Push notification management
- **StoreManager.js** - Centralized store initialization

### Services

- **appwrite.js** - Appwrite client configuration
- **auth.js** - Authentication service layer
- **offline.js** - Dexie.js IndexedDB operations
- **sync.js** - Online/offline data synchronization
- **notifications.js** - Notification service

### Composables

- **useChartDefaults** - Chart.js configuration
- **useDataExport** - Data export functionality
- **useErrorHandling** - Error management utilities

### Key Patterns

**Component Architecture:**

- Use `<script setup>` syntax with Composition API only
- Base components for reusable UI elements
- Optimized components for performance-critical features

**Store Architecture (Object Syntax):**

```js
export const useExampleStore = defineStore('example', {
  state: () => ({ /* state */ }),
  getters: { /* computed */ },
  actions: { /* async methods with try/catch */ }
})
```

**Import Path Aliases:**

- `@/` or `src/` → `frontend/src/`
- `components/`, `stores/`, `services/`, `pages/`, `layouts/`, `router/`, `boot/`, `assets/`

## Critical Development Rules

### JavaScript Only

- **CRITICAL**: Use ONLY native JavaScript - NO TypeScript
- All files: `.js` for JavaScript, `.vue` for Vue components
- Composition API only (no Options API)
- Prefer Quasar's built-in components, methods, classes, and plugins

### Mobile-First Design

- Design for mobile first, then enhance for larger screens
- Touch targets at least 44px for usability
- Test layouts on small screens (320px minimum width)

### Offline-First Architecture

- Primary storage: IndexedDB via Dexie.js
- Save data locally first, sync to Appwrite when online
- Support "local auth" using localStorage for offline mode

## Testing

### Test Environment

- Framework: Vitest with happy-dom
- Vue integration: Vue Test Utils + @pinia/testing
- Date fixed to `2024-01-15T10:00:00.000Z` for consistency
- localStorage, Quasar plugins, and window.location mocked

### Global Test Fixtures (from test/setup.js)

```js
createMockUser()           // Returns test user object
createMockMeal(overrides)  // Returns test meal with optional overrides
createMockFastingSession() // Returns test fasting session
```

### Mocking Strategy

- localStorage fully mocked
- Appwrite mocked for offline-first testing
- Quasar $q (notify, loading, localStorage) mocked

## Environment Variables

```bash
VITE_APPWRITE_ENDPOINT     # Appwrite API endpoint (https://cloud.appwrite.io/v1)
VITE_APPWRITE_PROJECT_ID   # Appwrite project ID
VITE_OFFLINE_MODE          # Force offline mode for testing
```

## Commit Message Format

Pre-commit hooks enforce conventional commits:

```
type(scope): description

# Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
# Examples:
feat: add new calorie tracking feature
fix(auth): resolve login issue
refactor(components): simplify dialog logic
```

Pre-commit also runs: lint, test:run, and checks for console.log statements.

## Error Handling

```javascript
import { ErrorFactory, ErrorUtils } from "../utils/errors.js";

const error = ErrorFactory.validation("calories", "Must be positive");
ErrorUtils.logError(error, "CaloriesStore.addMeal");
```

## Anti-Patterns to Avoid

- Don't mix Composition API with Options API
- Don't mutate props directly
- Don't forget to cleanup timers and event listeners
- Don't put everything in global state - use local state when appropriate
- Avoid directly mutating state outside of store actions
- Prefer computed properties over watchers

## Dependencies

Only use dependencies already listed in package.json. Prefer Quasar components over external UI libraries.

## Documentation

- `frontend/DEVELOPER_GUIDE.md` - Detailed development workflow
- `frontend/TEST_GUIDE.md` - Comprehensive testing documentation
- `.cursor/rules/default.mdc` - AI development rules with self-updating protocol