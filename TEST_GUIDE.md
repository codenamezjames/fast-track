# Testing Guide - FastTrack Energy Tracker

This guide explains the comprehensive testing setup for the FastTrack application, designed to be easily run by AI agents and developers from the CLI.

## Test Setup Overview

### Testing Stack

- **Vitest**: Fast unit test runner with ESM support
- **Vue Test Utils**: Official testing utilities for Vue.js components
- **@pinia/testing**: Testing utilities for Pinia stores
- **Happy-DOM**: Lightweight DOM implementation for tests
- **Coverage**: Built-in coverage reporting with V8

### Project Structure

```
test/
├── setup.js              # Global test configuration
├── stores/               # Pinia store tests
│   ├── calories.test.js
│   ├── auth.test.js
│   └── fasting.test.js
├── components/           # Vue component tests
│   ├── CaloriesChart.test.js
│   ├── FastingTimer.test.js
│   └── MealsHistory.test.js
├── services/            # Service layer tests
│   ├── auth.test.js
│   ├── offline.test.js
│   └── notifications.test.js
└── integration/         # Integration tests
    └── app-flow.test.js
```

## CLI Commands for AI Agents

### Quick Test Commands

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode (for development)
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD with JSON output
npm run test:ci

# Run specific test file
npx vitest run test/stores/calories.test.js

# Run tests matching a pattern
npx vitest run --grep "auth"
```

### Coverage and Reporting

```bash
# Generate coverage report in multiple formats
npm run test:coverage

# View coverage in browser (after running coverage)
open coverage/index.html

# Get test results in JSON format for automation
npm run test:ci
# Results will be in test-results.json
```

## Test Categories

### 1. Store Tests (Pinia)

**Location**: `test/stores/`
**Purpose**: Test state management, actions, getters, and business logic

**Example**: `calories.test.js`

```javascript
// Tests cover:
- Initial state validation
- Getter calculations (calories by date, weekly totals)
- CRUD operations (add, update, delete meals)
- Error handling
- Offline storage integration
- Data synchronization
```

**Key Features Tested**:

- ✅ Data persistence with IndexedDB
- ✅ Offline-first functionality
- ✅ Error handling and recovery
- ✅ State reactivity
- ✅ Business logic calculations

### 2. Component Tests (Vue)

**Location**: `test/components/`
**Purpose**: Test UI components, props, events, and rendering

**Example**: `CaloriesChart.test.js`

```javascript
// Tests cover:
- Component rendering
- Props validation
- Event emission
- SVG path generation
- Responsive behavior
- Edge cases (empty data, large numbers)
```

**Key Features Tested**:

- ✅ Component mounting and unmounting
- ✅ Props reactivity
- ✅ DOM structure and classes
- ✅ User interactions
- ✅ Conditional rendering

### 3. Service Tests

**Location**: `test/services/`
**Purpose**: Test API integration, authentication, and data services

**Example**: `auth.test.js`

```javascript
// Tests cover:
- Appwrite API integration
- Login/logout flows
- Registration process
- Offline fallback mechanisms
- Error handling
```

**Key Features Tested**:

- ✅ API calls and responses
- ✅ Authentication flows
- ✅ Offline/online mode switching
- ✅ Error handling and recovery
- ✅ Data validation

## Test Utilities and Mocks

### Global Test Utilities

Available in all test files via `test/setup.js`:

```javascript
// Create mock user
const user = createMockUser()

// Create mock meal with custom properties
const meal = createMockMeal({ calories: 600, notes: 'Custom meal' })

// Create mock fasting session
const session = createMockFastingSession({ duration_hours: 16 })
```

### Mocked Services

- **localStorage**: Fully mocked for consistent testing
- **Appwrite**: Mocked to test offline-first behavior
- **Date**: Fixed to `2024-01-15T10:00:00.000Z` for consistent time-based tests
- **Quasar**: UI components and plugins mocked

## AI Agent Testing Workflow

### 1. Quick Health Check

```bash
npm run test:run
```

**Expected Output**: All tests pass with coverage summary

### 2. Detailed Analysis

```bash
npm run test:coverage
```

**Expected Output**:

- Coverage report showing >80% coverage
- Detailed file-by-file breakdown
- HTML report for detailed analysis

### 3. Continuous Testing

```bash
npm test
```

**Expected Output**: Watch mode for real-time feedback during development

### 4. CI/CD Integration

```bash
npm run test:ci
```

**Expected Output**: JSON file with test results for automated analysis

## Test Patterns and Examples

### Testing a Store Action

```javascript
it('should add a meal successfully', async () => {
  const result = await caloriesStore.addMeal(500, 'Test meal')

  expect(result).toEqual({
    id: expect.any(Number),
    user_id: 'test-user-123',
    calories: 500,
    meal_time: expect.any(String),
    notes: 'Test meal',
    synced: false,
  })

  expect(caloriesStore.meals).toHaveLength(1)
})
```

### Testing a Component

```javascript
it('should render SVG with correct dimensions', () => {
  const svg = wrapper.find('svg')
  expect(svg.exists()).toBe(true)
  expect(svg.attributes('width')).toBe('320')
  expect(svg.attributes('height')).toBe('120')
})
```

### Testing Error Handling

```javascript
it('should handle add meal errors', async () => {
  const { offlineOperations } = await import('../../src/services/offline.js')
  offlineOperations.addToOffline.mockRejectedValue(new Error('Add failed'))

  await expect(caloriesStore.addMeal(500)).rejects.toThrow('Add failed')
  expect(caloriesStore.error).toBe('Add failed')
})
```

## Performance and Best Practices

### Test Performance

- **Fast execution**: Tests run in ~2-5 seconds
- **Parallel execution**: Vitest runs tests in parallel by default
- **Watch mode**: Only re-runs affected tests
- **Memory efficient**: Uses Happy-DOM instead of JSDOM

### Best Practices

1. **Isolation**: Each test is independent with fresh state
2. **Mocking**: External dependencies are mocked consistently
3. **Coverage**: Aim for >80% coverage on critical paths
4. **Naming**: Descriptive test names explaining the scenario
5. **Structure**: Tests grouped by functionality using `describe` blocks

## Troubleshooting

### Common Issues

1. **Mock not working**: Ensure `vi.clearAllMocks()` in `beforeEach`
2. **Component not mounting**: Check Quasar plugin setup in `test/setup.js`
3. **Store test failing**: Verify Pinia setup with `setActivePinia(createPinia())`
4. **Path issues**: Check alias configuration in `vitest.config.js`

### Debug Commands

```bash
# Run single test file with verbose output
npx vitest run test/stores/calories.test.js --reporter=verbose

# Run tests with debugging
npx vitest run --inspect-brk

# Check test file patterns
npx vitest list
```

## Integration with Development Workflow

### Pre-commit Testing

```bash
# Run quick test suite before committing
npm run test:run && npm run lint
```

### CI/CD Pipeline

```bash
# Full test suite with coverage for CI
npm run test:ci
npm run test:coverage
```

### Development Workflow

```bash
# Start watch mode for active development
npm test
# Tests will re-run automatically on file changes
```

This testing setup provides comprehensive coverage and is optimized for AI agent automation while maintaining developer-friendly workflows.
