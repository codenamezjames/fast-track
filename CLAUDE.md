# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FastTrack is a mobile-first calorie and intermittent fasting tracker built with Vue 3, Quasar Framework, and Appwrite backend. The application features offline-first architecture with comprehensive testing support.

## Key Technologies

- **Frontend**: Vue 3 with Composition API only (NO TypeScript)
- **UI Framework**: Quasar Framework (mobile-first responsive design)
- **State Management**: Pinia stores
- **Backend**: Appwrite (auth, database, real-time) with offline fallback
- **Offline Storage**: IndexedDB via Dexie.js
- **Build**: Vite via Quasar CLI
- **Testing**: Vitest with Vue Test Utils
- **Mobile**: Capacitor for native apps

## Development Commands

### Essential Commands

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
npm run quality:check          # Run lint + format check
npm run quality:fix            # Fix linting and formatting

# Setup
npm run setup                  # Initial development setup
npm run dev:reset              # Reset development environment
```

### Testing Specific Files

```bash
# Run specific test file
npx vitest run test/stores/calories.test.js

# Run tests matching pattern
npx vitest run --grep "auth"

# Debug tests
npx vitest run --inspect-brk
```

## Architecture Overview

### Project Structure

```
frontend/
├── src/
│   ├── components/          # Vue components
│   │   ├── base/           # Base reusable components
│   │   ├── optimized/      # Performance-optimized components
│   │   └── settings/       # Settings-specific components
│   ├── composables/        # Vue composables for reusable logic
│   ├── stores/             # Pinia stores
│   │   └── base/          # Base store patterns
│   ├── services/           # API and business logic
│   │   ├── base/          # Base service patterns
│   │   └── api/           # API service layer
│   ├── repositories/       # Data access layer (Dexie)
│   ├── pages/              # Route components
│   ├── layouts/            # Layout components
│   └── router/             # Vue Router configuration
├── test/                   # Comprehensive test suite
│   ├── stores/             # Pinia store tests
│   ├── components/         # Vue component tests
│   ├── services/           # Service layer tests
│   └── integration/        # Integration tests
└── backend/                # Appwrite backend configuration
```

### Key Patterns

**Component Architecture:**

- Use `<script setup>` syntax with Composition API only
- Base components for reusable UI elements
- Optimized components for performance-critical features
- Feature-specific components for business logic

**Store Architecture:**

- Base store pattern for common functionality (loading, error handling, sync)
- Data store pattern for CRUD operations
- Settings store pattern for preferences management
- Offline-first with IndexedDB persistence

**Service Architecture:**

- Base service for common functionality (retry, interceptors, offline queue)
- Repository pattern for data access abstraction
- API service for unified Appwrite handling

## Critical Development Rules

### JavaScript Only

- **CRITICAL**: Use ONLY native JavaScript - NO TypeScript at all
- All files should use `.js` extension for JavaScript and `.vue` for Vue components
- Use Composition API only (no Options API)

### Mobile-First Design

- Always design for mobile first, then enhance for larger screens
- Use Quasar's responsive utilities and breakpoints
- Ensure touch targets are at least 44px for mobile usability
- Test layouts on small screens (320px width minimum)

### Offline-First Architecture

- Primary storage: IndexedDB via Dexie.js
- Always save data locally first, sync to Appwrite when online
- Support "local auth" using localStorage for offline mode
- Handle offline scenarios gracefully

### Performance Guidelines

- Use dynamic imports for route components
- Lazy load non-critical components
- Implement virtual scrolling for long lists
- Use `shallowRef` for large objects
- Debounce chart updates and implement data decimation

## Testing Philosophy

The testing setup is optimized for AI agent automation:

- Fast execution (~2-5 seconds)
- JSON output for automation
- Comprehensive coverage reporting
- CLI-friendly commands

**Test Coverage:**

- Unit tests for stores, components, and services
- Integration tests for cross-component interactions
- Error handling and offline scenarios
- Visual regression tests for UI consistency

**Mocking Strategy:**

- localStorage fully mocked
- Appwrite mocked for offline-first testing
- Date fixed to `2024-01-15T10:00:00.000Z` for consistency
- Quasar components and plugins mocked

## Build Configuration

### Performance Optimizations

- Enhanced manual chunk splitting for better caching
- Tree shaking optimization
- Compression optimization
- Source maps for development only
- PWA with service worker and offline support

### PWA Configuration

- Workbox service worker with strategic caching
- Offline support with app-like experience
- Push notifications support
- Mobile app shortcuts for quick access

## Common Anti-Patterns to Avoid

### Vue.js

- Don't mix Composition API with Options API
- Don't mutate props directly
- Avoid deep nesting in template expressions
- Don't forget to cleanup timers and event listeners

### State Management

- Don't put everything in global state - use local state when appropriate
- Avoid directly mutating state outside of store actions
- Don't create circular dependencies between stores

### Performance

- Avoid creating reactive objects in render functions
- Don't overuse watchers - prefer computed properties
- Minimize DOM manipulations in loops

## Error Handling

Use the established error handling patterns:

```javascript
import { ErrorFactory, ErrorUtils } from "../utils/errors.js";

// Create typed errors
const error = ErrorFactory.validation("calories", "Must be positive");

// Log errors with context
ErrorUtils.logError(error, "CaloriesStore.addMeal");
```

## Mobile App Development

### Capacitor Integration

- Native mobile apps via Quasar Capacitor
- Platform-specific configurations in `src-capacitor/`
- Proper app icons and splash screens
- Device-specific features (notifications, storage)

### PWA Features

- Service worker with strategic caching
- Offline functionality
- App-like experience on mobile
- Push notifications support

## Quality Gates

- All tests must pass before committing
- No ESLint errors
- Code coverage > 30%
- Bundle size < 2MB
- Mobile responsiveness verified
- Performance benchmarks met

## Environment Setup

The project uses Node.js 18+ and supports multiple environments:

- Development: Hot reload with error reporting
- Production: Optimized build with PWA support
- Testing: Isolated test environment with comprehensive mocking

## Important Files

- `.cursor/rules/default.mdc`: Comprehensive AI development rules
- `quasar.config.js`: Build configuration with performance optimizations
- `frontend/README.md`: Project overview and setup instructions
- `frontend/DEVELOPER_GUIDE.md`: Detailed development workflow
- `frontend/TEST_GUIDE.md`: Comprehensive testing documentation

## Dependencies

Only use dependencies already listed in package.json. Before suggesting new dependencies, check if existing ones can solve the problem. Prefer Quasar components over external UI libraries.

## Mobile-First Considerations

Every code change should support:

- User experience on mobile devices
- Offline functionality where applicable
- Performance optimization for mobile networks
- Touch-friendly interfaces
- Responsive design patterns

Remember: This is a mobile-first health tracking app where user experience, offline functionality, and data reliability are paramount.
