import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';

test.describe('Dashboard Navigation', () => {
  let appPage: AppPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    await appPage.navigateToApp();
  });

  test('should load the app with navbar visible', async () => {
    await appPage.assertNavbarVisible();
    const title = await appPage.getAppTitle();
    expect(title).toBe('KTLO Dashboard');
  });

  test('should show KTLO Tasks tab as active by default', async () => {
    await appPage.assertKtloTasksTabActive();
    const activeTab = await appPage.getActiveTabName();
    expect(activeTab).toBe('KTLO Tasks');
  });

  test('should display "Active" badge on default tab', async () => {
    await appPage.assertActiveBadgeVisible();
    const badgeCount = await appPage.getActiveBadgeCount();
    expect(badgeCount).toBe(1);
  });

  test('should switch to Database Versions tab when clicked', async ({ page }) => {
    await appPage.clickDatabaseVersionsTab();
    await appPage.assertDatabaseVersionsTabActive();

    // Verify active badge is still visible (on new tab)
    await appPage.assertActiveBadgeVisible();
  });

  test('should switch back to KTLO Tasks tab', async () => {
    // First switch to Database Versions
    await appPage.clickDatabaseVersionsTab();
    await appPage.assertDatabaseVersionsTabActive();

    // Then switch back to KTLO Tasks
    await appPage.clickKtloTasksTab();
    await appPage.assertKtloTasksTabActive();
  });

  test('should show app subtitle', async () => {
    const subtitleVisible = await appPage.isSubtitleVisible();
    expect(subtitleVisible).toBe(true);
  });

  test('should maintain only one active badge at a time', async () => {
    // Check initial state
    let badgeCount = await appPage.getActiveBadgeCount();
    expect(badgeCount).toBe(1);

    // Switch tabs
    await appPage.clickDatabaseVersionsTab();
    badgeCount = await appPage.getActiveBadgeCount();
    expect(badgeCount).toBe(1);

    // Switch back
    await appPage.clickKtloTasksTab();
    badgeCount = await appPage.getActiveBadgeCount();
    expect(badgeCount).toBe(1);
  });

  test('should update tab styling when switching', async ({ page }) => {
    // Initial state - KTLO Tasks is active
    expect(await appPage.isKtloTasksTabActive()).toBe(true);
    expect(await appPage.isDatabaseVersionsTabActive()).toBe(false);

    // Switch to Database Versions
    await appPage.clickDatabaseVersionsTab();
    expect(await appPage.isKtloTasksTabActive()).toBe(false);
    expect(await appPage.isDatabaseVersionsTabActive()).toBe(true);

    // Switch back
    await appPage.clickKtloTasksTab();
    expect(await appPage.isKtloTasksTabActive()).toBe(true);
    expect(await appPage.isDatabaseVersionsTabActive()).toBe(false);
  });
});
