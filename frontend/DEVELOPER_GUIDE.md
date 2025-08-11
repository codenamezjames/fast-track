# FastTrack Developer Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup

```bash
# Clone and setup
git clone <repository>
cd frontend
npm run setup

# Start development
npm run dev
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Vue components
│   │   ├── base/           # Base components (reusable)
│   │   ├── optimized/      # Performance-optimized components
│   │   └── settings/       # Settings-specific components
│   ├── composables/        # Vue composables (reusable logic)
│   ├── stores/             # Pinia stores
│   │   └── base/          # Base store patterns
│   ├── services/           # API and business logic
│   │   └── base/          # Base service patterns
│   ├── repositories/       # Data access layer
│   ├── utils/              # Utility functions
│   └── pages/              # Route components
├── test/                   # Test files
│   ├── integration/        # Integration tests
│   └── visual/            # Visual regression tests
└── scripts/               # Development scripts
```

## 🏗️ Architecture Patterns

### Component Architecture

- **Base Components**: Reusable UI components (`BaseDialog`, `BaseStatsCard`)
- **Optimized Components**: Performance-focused components (`OptimizedChart`, `LazyLoad`)
- **Feature Components**: Feature-specific components

### Store Architecture

- **Base Store Pattern**: Common functionality (loading, error handling, sync)
- **Data Store Pattern**: CRUD operations with standardized patterns
- **Settings Store Pattern**: Preferences management

### Service Architecture

- **Base Service**: Common service functionality (retry, interceptors, offline queue)
- **Repository Pattern**: Data access abstraction
- **API Service**: Unified API handling

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- test/stores/calories.test.js
```

### Test Structure

- **Unit Tests**: Individual component/function tests
- **Integration Tests**: Cross-store and service interactions
- **Visual Tests**: Component rendering and UI consistency

### Writing Tests

```javascript
// Component test example
import { mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import MyComponent from '../MyComponent.vue'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(MyComponent, {
      global: { plugins: [Quasar] },
      props: { title: 'Test' },
    })

    expect(wrapper.find('.title').text()).toBe('Test')
  })
})
```

## 🔧 Development Workflow

### Code Quality

```bash
# Check code quality
npm run quality:check

# Fix code quality issues
npm run quality:fix

# Lint only
npm run lint

# Format code
npm run format:fix
```

### Git Workflow

- **Pre-commit**: Automatic linting and testing
- **Commit Messages**: Use conventional commits format
- **Quality Gates**: All tests must pass before commit

### Commit Message Format

```
type(scope): description

Examples:
feat: add new calorie tracking feature
fix(auth): resolve login issue
docs: update README
refactor(components): simplify dialog logic
```

## 📊 Performance

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Generate bundle report
npm run build:analyze
```

### Performance Monitoring

- Use `PerformanceMonitor` component for real-time metrics
- Monitor memory usage and frame rate
- Track long tasks and performance bottlenecks

### Optimization Tips

1. Use `shallowRef` for large objects
2. Implement virtual scrolling for long lists
3. Use lazy loading for heavy components
4. Debounce chart updates
5. Implement data decimation for large datasets

## 🐛 Debugging

### Error Handling

```javascript
import { ErrorFactory, ErrorUtils } from '../utils/errors.js'

// Create typed errors
const error = ErrorFactory.validation('calories', 'Must be positive')

// Log errors with context
ErrorUtils.logError(error, 'CaloriesStore.addMeal')
```

### Debug Tools

- Vue DevTools for component debugging
- Browser DevTools for network and performance
- Performance Monitor for real-time metrics

### Common Issues

1. **Store not updating**: Check if using `$reset()` in tests
2. **Component not rendering**: Verify Quasar plugin is loaded in tests
3. **Network errors**: Check offline/online status
4. **Performance issues**: Use PerformanceMonitor to identify bottlenecks

## 📚 Documentation

### Generating Docs

```bash
# Generate JSDoc documentation
npm run docs:generate

# Serve documentation
npm run docs:serve

# Watch for changes
npm run docs:watch
```

### Documentation Standards

- Use JSDoc for all functions and classes
- Include examples in documentation
- Document error types and handling
- Add component usage examples

## 🚀 Deployment

### Build Commands

```bash
# Development build
npm run build

# Production build
npm run build:prod

# PWA build
npm run build:pwa
```

### Environment Variables

- `NODE_ENV`: Set to 'production' for production builds
- `VITE_API_URL`: Backend API URL
- `VITE_APPWRITE_ENDPOINT`: Appwrite endpoint

## 🔄 Refactoring Guidelines

### When to Refactor

- Component exceeds 200 lines
- Duplicate code patterns
- Performance bottlenecks
- Poor test coverage

### Refactoring Process

1. Write tests first
2. Create new components/patterns
3. Migrate incrementally
4. Update documentation
5. Verify functionality

### Code Standards

- Use Composition API only
- Prefer Quasar components over custom UI
- Follow established patterns
- Write self-documenting code
- Add comprehensive error handling

## 🤝 Contributing

### Development Setup

1. Run `npm run setup`
2. Ensure all tests pass
3. Follow code quality standards
4. Update documentation
5. Test on mobile devices

### Quality Gates

- All tests must pass
- No ESLint errors
- Code coverage > 30%
- Bundle size within limits
- Performance benchmarks met

## 📈 Monitoring

### Performance Metrics

- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse Performance Score > 90
- Bundle size < 2MB

### Quality Metrics

- Test coverage > 30%
- Zero ESLint errors
- All accessibility checks pass
- Mobile responsiveness verified

## 🆘 Getting Help

### Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Quasar Framework](https://quasar.dev/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vitest Testing](https://vitest.dev/)

### Common Patterns

- See `src/components/base/` for reusable components
- See `src/stores/base/` for store patterns
- See `src/services/base/` for service patterns
- See `test/` for testing examples
