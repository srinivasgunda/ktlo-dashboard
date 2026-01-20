import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for the main App component.
 * Handles tab navigation between KTLO Tasks and Database Versions dashboards.
 */
export class AppPage extends BasePage {
  // Locators for navigation elements
  private readonly navbar: Locator;
  private readonly appTitle: Locator;
  private readonly ktloTasksTab: Locator;
  private readonly databaseVersionsTab: Locator;
  private readonly activeTabBadge: Locator;

  constructor(page: Page) {
    super(page);

    // Navbar elements
    this.navbar = page.locator('nav');
    this.appTitle = page.getByText('KTLO Dashboard');

    // Tab navigation buttons (using role and text)
    this.ktloTasksTab = page.getByRole('button', { name: /KTLO Tasks/ });
    this.databaseVersionsTab = page.getByRole('button', { name: /Database Versions/ });

    // Active tab badge
    this.activeTabBadge = page.locator('text=Active');
  }

  /**
   * Navigate to the application root
   */
  async navigateToApp() {
    await this.goto('/');
    await this.waitForAppLoad();
  }

  /**
   * Wait for app to be fully loaded
   */
  async waitForAppLoad() {
    await this.assertVisible(this.navbar, 'Navbar should be visible');
    await this.assertVisible(this.appTitle, 'App title should be visible');
  }

  /**
   * Click the KTLO Tasks tab
   */
  async clickKtloTasksTab() {
    await this.clickElement(this.ktloTasksTab);
    // Wait for tab to become active
    await this.page.waitForTimeout(300); // Small delay for animation
  }

  /**
   * Click the Database Versions tab
   */
  async clickDatabaseVersionsTab() {
    await this.clickElement(this.databaseVersionsTab);
    // Wait for tab to become active
    await this.page.waitForTimeout(300); // Small delay for animation
  }

  /**
   * Check if KTLO Tasks tab is active
   */
  async isKtloTasksTabActive(): Promise<boolean> {
    const tab = this.ktloTasksTab;
    const classList = await tab.getAttribute('class');
    return classList?.includes('text-blue-600') ?? false;
  }

  /**
   * Check if Database Versions tab is active
   */
  async isDatabaseVersionsTabActive(): Promise<boolean> {
    const tab = this.databaseVersionsTab;
    const classList = await tab.getAttribute('class');
    return classList?.includes('text-blue-600') ?? false;
  }

  /**
   * Get the active tab name
   */
  async getActiveTabName(): Promise<string> {
    if (await this.isKtloTasksTabActive()) {
      return 'KTLO Tasks';
    }
    if (await this.isDatabaseVersionsTabActive()) {
      return 'Database Versions';
    }
    return 'Unknown';
  }

  /**
   * Assert KTLO Tasks tab is active
   */
  async assertKtloTasksTabActive() {
    const isActive = await this.isKtloTasksTabActive();
    if (!isActive) {
      throw new Error('KTLO Tasks tab is not active');
    }
  }

  /**
   * Assert Database Versions tab is active
   */
  async assertDatabaseVersionsTabActive() {
    const isActive = await this.isDatabaseVersionsTabActive();
    if (!isActive) {
      throw new Error('Database Versions tab is not active');
    }
  }

  /**
   * Assert navbar is visible
   */
  async assertNavbarVisible() {
    await this.assertVisible(this.navbar, 'Navbar should be visible');
    await this.assertVisible(this.appTitle, 'App title should be visible');
  }

  /**
   * Assert active badge is visible on current tab
   */
  async assertActiveBadgeVisible() {
    await this.assertVisible(this.activeTabBadge, 'Active badge should be visible');
  }

  /**
   * Get active badge count (should be 1 - only one tab active at a time)
   */
  async getActiveBadgeCount(): Promise<number> {
    return await this.getElementCount(this.activeTabBadge);
  }

  /**
   * Use keyboard to navigate between tabs
   */
  async navigateTabsWithKeyboard(direction: 'forward' | 'backward') {
    if (direction === 'forward') {
      await this.pressKey('Tab');
      await this.pressKey('Enter');
    } else {
      await this.pressKey('Shift+Tab');
      await this.pressKey('Enter');
    }
  }

  /**
   * Get the text of the app title
   */
  async getAppTitle(): Promise<string> {
    return await this.getTextContent(this.appTitle);
  }

  /**
   * Check if the app subtitle is visible
   */
  async isSubtitleVisible(): Promise<boolean> {
    const subtitle = this.page.getByText('AWS Operations Tracker');
    return await this.isVisible(subtitle);
  }
}
