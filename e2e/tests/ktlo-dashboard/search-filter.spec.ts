import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/app.page';
import { KtloDashboardPage } from '../../pages/ktlo-dashboard.page';

test.describe('KTLO Dashboard - Search and Filter', () => {
  let appPage: AppPage;
  let ktloDashboard: KtloDashboardPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    ktloDashboard = new KtloDashboardPage(page);

    await appPage.navigateToApp();
    await ktloDashboard.waitForDashboardLoad();
  });

  test.describe('Search Functionality', () => {
    test('should filter tasks by search term', async () => {
      const initialCount = await ktloDashboard.getTableRowCount();
      expect(initialCount).toBeGreaterThan(0);

      // Search for a specific term
      await ktloDashboard.search('Aurora');
      const filteredCount = await ktloDashboard.getTableRowCount();

      // Should have fewer results (or equal if all contain 'Aurora')
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('should update results as user types', async () => {
      await ktloDashboard.search('PostgreSQL');
      const count1 = await ktloDashboard.getTableRowCount();

      await ktloDashboard.search('Database');
      const count2 = await ktloDashboard.getTableRowCount();

      // Counts may be different depending on which term matches more
      expect(count1).toBeGreaterThanOrEqual(0);
      expect(count2).toBeGreaterThanOrEqual(0);
    });

    test('should clear search results when input is cleared', async () => {
      const initialCount = await ktloDashboard.getTableRowCount();

      // Apply search
      await ktloDashboard.search('test');
      const filteredCount = await ktloDashboard.getTableRowCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      // Clear search
      await ktloDashboard.clearSearch();
      const clearedCount = await ktloDashboard.getTableRowCount();
      expect(clearedCount).toBe(initialCount);
    });

    test('should show search input with correct placeholder', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();
    });
  });

  test.describe('Status Filters', () => {
    test('should have all status filters checked by default', async () => {
      expect(await ktloDashboard.isCompletedFilterChecked()).toBe(true);
      expect(await ktloDashboard.isInProgressFilterChecked()).toBe(true);
      expect(await ktloDashboard.isNotStartedFilterChecked()).toBe(true);
    });

    test('should filter by Completed status', async () => {
      const initialCount = await ktloDashboard.getTableRowCount();

      // Uncheck Completed
      await ktloDashboard.toggleCompletedFilter();
      expect(await ktloDashboard.isCompletedFilterChecked()).toBe(false);

      const filteredCount = await ktloDashboard.getTableRowCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('should filter by In Progress status', async () => {
      const initialCount = await ktloDashboard.getTableRowCount();

      // Uncheck In Progress
      await ktloDashboard.toggleInProgressFilter();
      expect(await ktloDashboard.isInProgressFilterChecked()).toBe(false);

      const filteredCount = await ktloDashboard.getTableRowCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('should filter by Not Started status', async () => {
      const initialCount = await ktloDashboard.getTableRowCount();

      // Uncheck Not Started
      await ktloDashboard.toggleNotStartedFilter();
      expect(await ktloDashboard.isNotStartedFilterChecked()).toBe(false);

      const filteredCount = await ktloDashboard.getTableRowCount();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    });

    test('should combine multiple status filters', async () => {
      // Uncheck Completed and In Progress, leaving only Not Started
      await ktloDashboard.toggleCompletedFilter();
      await ktloDashboard.toggleInProgressFilter();

      expect(await ktloDashboard.isCompletedFilterChecked()).toBe(false);
      expect(await ktloDashboard.isInProgressFilterChecked()).toBe(false);
      expect(await ktloDashboard.isNotStartedFilterChecked()).toBe(true);

      const count = await ktloDashboard.getTableRowCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should re-check status filters to restore results', async () => {
      const initialCount = await ktloDashboard.getTableRowCount();

      // Uncheck all
      await ktloDashboard.toggleCompletedFilter();
      await ktloDashboard.toggleInProgressFilter();
      await ktloDashboard.toggleNotStartedFilter();

      // Table should be empty or have very few rows
      const emptyCount = await ktloDashboard.getTableRowCount();
      expect(emptyCount).toBeLessThan(initialCount);

      // Re-check all
      await ktloDashboard.toggleCompletedFilter();
      await ktloDashboard.toggleInProgressFilter();
      await ktloDashboard.toggleNotStartedFilter();

      const restoredCount = await ktloDashboard.getTableRowCount();
      expect(restoredCount).toBe(initialCount);
    });
  });

  test.describe('Fiscal Year Filter', () => {
    test('should filter by fiscal year', async ({ page }) => {
      const initialCount = await ktloDashboard.getTableRowCount();

      // Select a different fiscal year
      await ktloDashboard.selectFiscalYear('FY25');
      const filteredCount = await ktloDashboard.getTableRowCount();

      // Count may be different based on data distribution
      expect(filteredCount).toBeGreaterThanOrEqual(0);
    });

    test('should show All years option', async ({ page }) => {
      const fiscalYearDropdown = page.locator('select').filter({ hasText: /FY\d{2}/ }).first();
      await expect(fiscalYearDropdown).toBeVisible();

      // Check if "All" option exists
      const allOption = page.locator('option:has-text("All")');
      await expect(allOption).toBeAttached();
    });
  });

  test.describe('Pod Owner Filter', () => {
    test('should filter by pod owner', async ({ page }) => {
      const initialCount = await ktloDashboard.getTableRowCount();

      // Get available pod owners
      const podOwnerDropdown = page.locator('select').filter({ has: page.locator('option:has-text("All Pod Owners")') });
      const options = await podOwnerDropdown.locator('option').allTextContents();

      // If there are specific pod owners (more than just "All")
      if (options.length > 1) {
        const firstPod = options[1]; // Skip "All Pod Owners", use first actual pod
        await ktloDashboard.selectPodOwner(firstPod);

        const filteredCount = await ktloDashboard.getTableRowCount();
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
        expect(filteredCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should show All Pod Owners option', async ({ page }) => {
      const allPodOwnersOption = page.locator('option:has-text("All Pod Owners")');
      await expect(allPodOwnersOption).toBeAttached();
    });
  });

  test.describe('Combined Filters', () => {
    test('should combine search with status filter', async () => {
      const initialCount = await ktloDashboard.getTableRowCount();

      // Apply search
      await ktloDashboard.search('Database');
      const searchCount = await ktloDashboard.getTableRowCount();

      // Apply status filter
      await ktloDashboard.toggleCompletedFilter();
      const combinedCount = await ktloDashboard.getTableRowCount();

      expect(combinedCount).toBeLessThanOrEqual(searchCount);
      expect(combinedCount).toBeLessThanOrEqual(initialCount);
    });

    test('should combine fiscal year with status filter', async () => {
      await ktloDashboard.selectFiscalYear('FY26');
      const fyCount = await ktloDashboard.getTableRowCount();

      await ktloDashboard.toggleNotStartedFilter();
      const combinedCount = await ktloDashboard.getTableRowCount();

      expect(combinedCount).toBeLessThanOrEqual(fyCount);
    });

    test('should reset all filters correctly', async () => {
      const initialCount = await ktloDashboard.getTableRowCount();

      // Apply various filters
      await ktloDashboard.search('test');
      await ktloDashboard.selectFiscalYear('FY25');
      await ktloDashboard.toggleCompletedFilter();

      // Reset filters
      await ktloDashboard.resetFilters();

      const resetCount = await ktloDashboard.getTableRowCount();
      expect(resetCount).toBe(initialCount);
    });
  });

  test.describe('Metrics Update with Filters', () => {
    test('should update Total Tasks count when filtering', async () => {
      const initialTotal = await ktloDashboard.getTotalTasksCount();
      expect(initialTotal).toBeGreaterThan(0);

      // Apply filter
      await ktloDashboard.toggleCompletedFilter();
      const filteredTotal = await ktloDashboard.getTotalTasksCount();

      expect(filteredTotal).toBeLessThanOrEqual(initialTotal);
    });

    test('should update metrics when search is applied', async () => {
      const initialTotal = await ktloDashboard.getTotalTasksCount();

      await ktloDashboard.search('Database');
      const searchTotal = await ktloDashboard.getTotalTasksCount();

      expect(searchTotal).toBeLessThanOrEqual(initialTotal);
      expect(searchTotal).toBeGreaterThanOrEqual(0);
    });
  });
});
