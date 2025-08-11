# Quasar App (fast-track)

A calorie tracker with intermittent fasting features built with Vue 3, Quasar Framework, and comprehensive testing.

## Features

- 📊 Calorie tracking with visual charts
- ⏱️ Intermittent fasting timer
- 📱 Progressive Web App (PWA)
- 🔒 Authentication with offline support
- 💾 Local storage with Dexie (IndexedDB)
- 🧪 Comprehensive test suite

## Install the dependencies

```bash
yarn
# or
npm install
```

## Development

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Testing

This project includes a comprehensive testing setup with Vitest, optimized for AI agent automation:

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD with JSON output
npm run test:ci

# Run specific test file
npx vitest run test/stores/calories.test.js
```

**Test Coverage Includes:**

- ✅ Pinia store tests (auth, calories, fasting)
- ✅ Vue component tests with Vue Test Utils
- ✅ Service layer tests (auth, offline storage)
- ✅ Error handling and edge cases
- ✅ Offline-first functionality

See `TEST_GUIDE.md` for detailed testing documentation.

### Code Quality

```bash
# Lint the files
yarn lint
# or
npm run lint

# Format the files
yarn format
# or
npm run format

# Run tests + linting
npm run test:run && npm run lint
```

### Build the app for production

```bash
quasar build
```

## Project Structure

```
src/
├── components/           # Vue components
├── layouts/             # Layout components
├── pages/               # Page components
├── stores/              # Pinia stores
├── services/            # API and utility services
├── router/              # Vue Router configuration
└── css/                 # Styles

test/
├── stores/              # Store unit tests
├── components/          # Component tests
├── services/            # Service tests
└── setup.js             # Test configuration
```

## Key Technologies

- **Vue 3** - Progressive JavaScript framework
- **Quasar Framework** - Vue.js based framework
- **Pinia** - State management
- **Dexie** - IndexedDB wrapper for offline storage
- **Appwrite** - Backend as a service (with offline fallback)
- **Vitest** - Fast unit test runner
- **Vue Test Utils** - Official testing utilities

## Testing Philosophy

This project follows a comprehensive testing approach:

1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - Component interaction and data flow
3. **Error Handling** - Offline scenarios and edge cases
4. **AI-Friendly** - CLI-based testing for automation

The testing setup is specifically designed to support AI agent workflows with:

- Fast execution (~2-5 seconds)
- JSON output for automation
- Comprehensive coverage reporting
- Clear success/failure indicators

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

## License

This project is private and proprietary.
