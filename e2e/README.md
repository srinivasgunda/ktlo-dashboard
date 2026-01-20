# E2E Testing with Playwright

This directory contains end-to-end (E2E) tests for the KTLO Dashboard application using Playwright.

## Overview

The E2E tests cover all critical user flows including:
- Tab navigation between KTLO Tasks and Database Versions dashboards
- Search and filter functionality
- Metric card interactions and drill-downs
- Chart interactions
- Table operations
- Modal behaviors
- Data loading and error states
- Responsive design

## Architecture

### Page Object Model (POM)

Tests use the Page Object Model pattern for better maintainability:

- **Base Page** (`pages/base.page.ts`): Common utilities for all pages
- **App Page** (`pages/app.page.ts`): Tab navigation and global app interactions
- **KTLO Dashboard Page** (`pages/ktlo-dashboard.page.ts`): KTLO Tasks dashboard interactions
- **Database Dashboard Page** (`pages/database-dashboard.page.ts`): Database Versions dashboard interactions

### Test Organization

```
e2e/
├── fixtures/           # Test data and fixtures
├── pages/             # Page Object Models
│   ├── components/    # Reusable component models
│   ├── base.page.ts
│   ├── app.page.ts
│   ├── ktlo-dashboard.page.ts
│   └── database-dashboard.page.ts
├── tests/             # Test specifications
│   ├── navigation.spec.ts
│   ├── ktlo-dashboard/
│   ├── database-dashboard/
│   ├── data-loading/
│   └── responsive/
└── utils/             # Helper utilities
```

## Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Running All Tests

```bash
# Run all tests (all browsers)
npm run test:e2e

# Run tests in Chromium only (faster)
npm run test:e2e:chromium
```

### Running Specific Tests

```bash
# Run navigation tests
npx playwright test navigation

# Run KTLO dashboard tests
npx playwright test ktlo-dashboard

# Run a specific test file
npx playwright test search-filter.spec.ts
```

### Interactive Modes

```bash
# UI Mode - Visual test runner with time-travel debugging
npm run test:e2e:ui

# Headed Mode - See browser while tests run
npm run test:e2e:headed

# Debug Mode - Step through tests
npm run test:e2e:debug
```

### Viewing Test Reports

```bash
# Open HTML test report
npm run test:e2e:report
```

## Writing New Tests

### 1. Create a New Test File

```typescript
import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';
import { KtloDashboardPage } from '../pages/ktlo-dashboard.page';

test.describe('Feature Name', () => {
  let appPage: AppPage;
  let ktloDashboard: KtloDashboardPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    ktloDashboard = new KtloDashboardPage(page);

    await appPage.navigateToApp();
    await ktloDashboard.waitForDashboardLoad();
  });

  test('should do something', async () => {
    // Your test code here
  });
});
```

### 2. Use Page Objects

Always interact with the application through page objects, not raw locators:

```typescript
// Good - Using page object methods
await ktloDashboard.search('Aurora');
await ktloDashboard.clickTotalTasksCard();

// Bad - Using raw locators
await page.locator('input').fill('Aurora');
await page.locator('div.card').click();
```

### 3. Add Assertions

Use clear, meaningful assertions:

```typescript
// Good
const count = await ktloDashboard.getTotalTasksCount();
expect(count).toBeGreaterThan(0);

// Better - With custom message
expect(count, 'Total tasks should be greater than 0').toBeGreaterThan(0);
```

## Test Data

Tests use the existing sample data files:
- `src/ktlo-data.sample.json` - KTLO Tasks sample data
- `src/aurora-data.sample.json` - Aurora Database sample data

The application automatically falls back to sample data when real data files are not present, making tests deterministic and reliable.

## CI/CD Integration

Tests run automatically on:
- Pull requests to `main`/`master`
- Pushes to `main`/`master`
- Manual workflow dispatch

See `.github/workflows/playwright.yml` for workflow configuration.

### Viewing CI Results

1. Go to the **Actions** tab in GitHub
2. Click on the latest workflow run
3. View test results and download artifacts:
   - Test results
   - HTML report
   - Traces (on failure)

## Debugging Tests

### Playwright Inspector

```bash
# Run test with inspector
npm run test:e2e:debug -- navigation.spec.ts
```

### Screenshots and Videos

Screenshots and videos are automatically captured on test failure:
- Location: `test-results/`
- Screenshots: Only on failure
- Videos: Retained on failure
- Traces: On first retry

### Viewing Traces

```bash
# If a test fails, view its trace
npx playwright show-trace test-results/[test-name]/trace.zip
```

## Best Practices

### DO

- Use Page Object Model consistently
- Write descriptive test names
- Use proper waits (built into page objects)
- Test user behavior, not implementation
- Keep tests independent
- Use meaningful assertions
- Add comments for complex logic

### DON'T

- Hard-code timeouts (use built-in waits)
- Use XPath when CSS selectors work
- Test multiple things in one test
- Rely on test execution order
- Leave debugging code (`page.pause()`)

## Locator Strategy

Priority order:
1. Test IDs (`data-testid` attributes)
2. Accessible labels (`role`, `aria-label`)
3. Text content (for static text)
4. CSS classes (avoid dynamic classes)

## Common Issues and Solutions

### Test Flakiness

**Problem**: Tests pass locally but fail in CI

**Solutions**:
- Use built-in Playwright waits (already in page objects)
- Avoid `page.waitForTimeout()` - use condition-based waits
- Check for animations and disable if needed

### Element Not Found

**Problem**: `Element not found` errors

**Solutions**:
- Verify the locator is correct
- Ensure the page is fully loaded (`waitForDashboardLoad()`)
- Check if the element is conditional (e.g., alert banner only shows when overdue)

### Modal Not Closing

**Problem**: Modal tests fail because modal doesn't close

**Solutions**:
- Use the provided modal methods: `closeModal()`, `closeModalWithEscape()`
- Wait for modal to be hidden: `waitForElementHidden()`

## Performance

- Full test suite: ~5-10 minutes on all browsers
- Chromium only: ~2-3 minutes
- Single test file: ~10-30 seconds

## Configuration

Edit `playwright.config.ts` to:
- Add/remove browsers
- Change parallelization
- Adjust timeouts
- Modify retry logic
- Change base URL

## Maintenance

### Weekly
- Review failed tests in CI
- Update flaky tests
- Check for new console errors

### Monthly
- Update Playwright version: `npm update @playwright/test`
- Review test coverage
- Refactor duplicate code

### When Adding Features
- Add corresponding E2E tests
- Update page objects if UI changes
- Update this README if workflow changes

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Guide](https://playwright.dev/docs/pom)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Support

For questions or issues with E2E tests:
1. Check this README
2. Review existing test files for examples
3. Check Playwright documentation
4. Create an issue in the repository
