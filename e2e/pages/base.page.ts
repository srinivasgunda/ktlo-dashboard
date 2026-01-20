import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page class with common utilities for all page objects.
 * Provides reusable methods for navigation, waiting, and assertions.
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific path relative to base URL
   */
  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for a specific element to be visible
   */
  async waitForElement(locator: Locator, options?: { timeout?: number }) {
    await locator.waitFor({ state: 'visible', ...options });
  }

  /**
   * Wait for a specific element to be hidden
   */
  async waitForElementHidden(locator: Locator, options?: { timeout?: number }) {
    await locator.waitFor({ state: 'hidden', ...options });
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }

  /**
   * Get text content from an element
   */
  async getTextContent(locator: Locator): Promise<string> {
    const text = await locator.textContent();
    return text?.trim() ?? '';
  }

  /**
   * Check if an element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if an element is hidden
   */
  async isHidden(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'hidden', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Click an element with automatic waiting
   */
  async clickElement(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Fill input field with automatic waiting
   */
  async fillInput(locator: Locator, value: string) {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }

  /**
   * Select dropdown option by value
   */
  async selectOption(locator: Locator, value: string) {
    await locator.waitFor({ state: 'visible' });
    await locator.selectOption(value);
  }

  /**
   * Get count of elements matching a locator
   */
  async getElementCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for URL to match a pattern
   */
  async waitForURL(pattern: string | RegExp) {
    await this.page.waitForURL(pattern);
  }

  /**
   * Get current URL
   */
  getCurrentURL(): string {
    return this.page.url();
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  /**
   * Reload the page
   */
  async reload() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Assert element is visible
   */
  async assertVisible(locator: Locator, message?: string) {
    await expect(locator, message).toBeVisible();
  }

  /**
   * Assert element is hidden
   */
  async assertHidden(locator: Locator, message?: string) {
    await expect(locator, message).toBeHidden();
  }

  /**
   * Assert element has text
   */
  async assertHasText(locator: Locator, text: string | RegExp, message?: string) {
    await expect(locator, message).toHaveText(text);
  }

  /**
   * Assert element contains text
   */
  async assertContainsText(locator: Locator, text: string | RegExp, message?: string) {
    await expect(locator, message).toContainText(text);
  }

  /**
   * Assert element has attribute with value
   */
  async assertHasAttribute(locator: Locator, name: string, value: string | RegExp, message?: string) {
    await expect(locator, message).toHaveAttribute(name, value);
  }

  /**
   * Assert element count
   */
  async assertElementCount(locator: Locator, count: number, message?: string) {
    await expect(locator, message).toHaveCount(count);
  }
}
