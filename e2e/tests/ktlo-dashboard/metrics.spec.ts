import { test, expect } from '@playwright/test';
import { AppPage } from '../../pages/app.page';
import { KtloDashboardPage } from '../../pages/ktlo-dashboard.page';

test.describe('KTLO Dashboard - Metrics', () => {
  let appPage: AppPage;
  let ktloDashboard: KtloDashboardPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    ktloDashboard = new KtloDashboardPage(page);

    await appPage.navigateToApp();
    await ktloDashboard.waitForDashboardLoad();
  });

  test.describe('Metric Cards Display', () => {
    test('should display Total Tasks metric card', async ({ page }) => {
      const count = await ktloDashboard.getTotalTasksCount();
      expect(count).toBeGreaterThan(0);

      // Verify metric card is visible
      const totalCard = page.locator('div.bg-white').filter({ hasText: 'Total Tasks' }).first();
      await expect(totalCard).toBeVisible();
    });

    test('should display Triaged metric card', async ({ page }) => {
      const count = await ktloDashboard.getTriagedCount();
      expect(count).toBeGreaterThanOrEqual(0);

      const triagedCard = page.locator('div.bg-white').filter({ hasText: 'Triaged' }).first();
      await expect(triagedCard).toBeVisible();
    });

    test('should display CCS Action metric card', async ({ page }) => {
      const count = await ktloDashboard.getCCSActionCount();
      expect(count).toBeGreaterThanOrEqual(0);

      const ccsCard = page.locator('div.bg-white').filter({ hasText: 'CCS Action' }).first();
      await expect(ccsCard).toBeVisible();
    });

    test('should display Completed metric card', async ({ page }) => {
      const count = await ktloDashboard.getCompletedCount();
      expect(count).toBeGreaterThanOrEqual(0);

      const completedCard = page.locator('div.bg-white').filter({ hasText: /^Completed/ }).first();
      await expect(completedCard).toBeVisible();
    });

    test('should show all four metric cards', async ({ page }) => {
      const cards = page.locator('div.bg-white.rounded-lg.border').filter({
        has: page.locator('h3.text-sm'),
      });
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });
  });

  test.describe('Metric Card Interactions', () => {
    test('should open drill-down modal when clicking Total Tasks card', async () => {
      await ktloDashboard.clickTotalTasksCard();

      // Wait for modal to open
      await expect(async () => {
        const isOpen = await ktloDashboard.isModalOpen();
        expect(isOpen).toBe(true);
      }).toPass({ timeout: 5000 });

      // Check modal title
      const modalTitle = await ktloDashboard.getModalTitle();
      expect(modalTitle).toContain('KTLO Tasks');
    });

    test('should open drill-down modal when clicking Triaged card', async () => {
      await ktloDashboard.clickTriagedCard();

      await expect(async () => {
        const isOpen = await ktloDashboard.isModalOpen();
        expect(isOpen).toBe(true);
      }).toPass({ timeout: 5000 });

      const modalTitle = await ktloDashboard.getModalTitle();
      expect(modalTitle).toContain('Triaged');
    });

    test('should open drill-down modal when clicking CCS Action card', async () => {
      await ktloDashboard.clickCCSActionCard();

      await expect(async () => {
        const isOpen = await ktloDashboard.isModalOpen();
        expect(isOpen).toBe(true);
      }).toPass({ timeout: 5000 });

      const modalTitle = await ktloDashboard.getModalTitle();
      expect(modalTitle).toContain('CCS Action');
    });

    test('should open drill-down modal when clicking Completed card', async () => {
      await ktloDashboard.clickCompletedMetricCard();

      await expect(async () => {
        const isOpen = await ktloDashboard.isModalOpen();
        expect(isOpen).toBe(true);
      }).toPass({ timeout: 5000 });

      const modalTitle = await ktloDashboard.getModalTitle();
      expect(modalTitle).toContain('Completed');
    });
  });

  test.describe('Timeline/Urgency Cards', () => {
    test('should display Overdue card', async ({ page }) => {
      const overdueCard = page.locator('div').filter({ hasText: 'Overdue' }).filter({ hasText: 'Past due date' });
      await expect(overdueCard).toBeVisible();

      const count = await ktloDashboard.getOverdueCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display Due in 7 Days card', async ({ page }) => {
      const dueCard = page.locator('div').filter({ hasText: 'Due in 7 Days' });
      await expect(dueCard).toBeVisible();
    });

    test('should display Due in 30 Days card', async ({ page }) => {
      const dueCard = page.locator('div').filter({ hasText: 'Due in 30 Days' });
      await expect(dueCard).toBeVisible();
    });

    test('should display Due in 90 Days card', async ({ page }) => {
      const dueCard = page.locator('div').filter({ hasText: 'Due in 90 Days' });
      await expect(dueCard).toBeVisible();
    });

    test('should open modal when clicking Overdue card', async () => {
      const overdueCount = await ktloDashboard.getOverdueCount();

      // Only click if there are overdue items
      if (overdueCount > 0) {
        await ktloDashboard.clickOverdueCard();

        await expect(async () => {
          const isOpen = await ktloDashboard.isModalOpen();
          expect(isOpen).toBe(true);
        }).toPass({ timeout: 5000 });
      }
    });
  });

  test.describe('Metric Calculations', () => {
    test('should show consistent Total Tasks count with table rows', async () => {
      const metricCount = await ktloDashboard.getTotalTasksCount();
      const tableCount = await ktloDashboard.getTableRowCount();

      // Metric count should match table row count
      expect(metricCount).toBe(tableCount);
    });

    test('should update metrics when filters are applied', async () => {
      const initialTotal = await ktloDashboard.getTotalTasksCount();
      const initialCompleted = await ktloDashboard.getCompletedCount();

      // Uncheck Completed filter
      await ktloDashboard.toggleCompletedFilter();

      const filteredTotal = await ktloDashboard.getTotalTasksCount();

      // Total should decrease (by the number of completed tasks)
      expect(filteredTotal).toBe(initialTotal - initialCompleted);
    });

    test('should show percentage in Triaged metric', async ({ page }) => {
      const triagedCard = page.locator('div.bg-white').filter({ hasText: 'Triaged' }).first();
      const percentageText = triagedCard.locator('text=/\\d+%/');

      await expect(percentageText).toBeVisible();
    });

    test('should show percentage in Completed metric', async ({ page }) => {
      const completedCard = page.locator('div.bg-white').filter({ hasText: /^Completed/ }).first();
      const percentageText = completedCard.locator('text=/\\d+%/');

      await expect(percentageText).toBeVisible();
    });
  });

  test.describe('Modal Close Functionality', () => {
    test.beforeEach(async () => {
      // Open a modal for these tests
      await ktloDashboard.clickTotalTasksCard();
      await expect(async () => {
        const isOpen = await ktloDashboard.isModalOpen();
        expect(isOpen).toBe(true);
      }).toPass({ timeout: 5000 });
    });

    test('should close modal with close button', async () => {
      await ktloDashboard.closeModal();

      await expect(async () => {
        const isOpen = await ktloDashboard.isModalOpen();
        expect(isOpen).toBe(false);
      }).toPass({ timeout: 5000 });
    });

    test('should close modal with Escape key', async () => {
      await ktloDashboard.closeModalWithEscape();

      await expect(async () => {
        const isOpen = await ktloDashboard.isModalOpen();
        expect(isOpen).toBe(false);
      }).toPass({ timeout: 5000 });
    });
  });

  test.describe('Metric Icons', () => {
    test('should display icons on metric cards', async ({ page }) => {
      // Check for SVG icons on metric cards
      const totalCard = page.locator('div.bg-white').filter({ hasText: 'Total Tasks' }).first();
      const icon = totalCard.locator('svg').first();
      await expect(icon).toBeVisible();
    });
  });
});
