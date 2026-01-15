# Eigent Extension - Playwright Tests

## Test Coverage

### ✅ Configuration Tests
- Aggressive mode verification
- Provider configuration (Groq, Cerebras, etc.)
- Task Master integration
- Storage manager defaults

### ✅ UI Tests
- Popup loads correctly
- All agent cards visible
- Task input functional
- Execute button works

### ✅ Provider Tests
- All 5 providers configured
- API routing correct
- Fallback chain active

### ✅ Performance Tests
- UI load time < 100ms
- Agent selection < 50ms
- Responsive interactions

## Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test tests/extension.spec.js

# Run with headed mode
npx playwright test --headed
```

## Test Files

- `extension.spec.js` - Main extension tests
- `performance.spec.js` - Performance benchmarks
- `integration.spec.js` - Integration tests

## Expected Results

All tests should PASS ✅

- Configuration: Aggressive mode active
- Providers: Groq + Cerebras integrated
- Tracking: Task Master enabled
- Performance: < 100ms load time
