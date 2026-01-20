import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for the Database Versions Dashboard.
 * Handles all interactions with the Database Versions dashboard including
 * environment filtering, metrics, charts, and table interactions.
 */
export class DatabaseDashboardPage extends BasePage {
  // Filter locators
  private readonly environmentDropdown: Locator;

  // Metric Cards
  private readonly totalDatabasesCard: Locator;
  private readonly nonCompliantCard: Locator;
  private readonly autoUpgradeEnabledCard: Locator;
  private readonly autoUpgradeDisabledCard: Locator;

  // EOL Timeline Cards
  private readonly eolCriticalCard: Locator;
  private readonly eolWarningCard: Locator;
  private readonly eolSafeCard: Locator;

  // Charts
  private readonly versionChart: Locator;
  private readonly environmentChart: Locator;
  private readonly eolTimelineChart: Locator;

  // Table
  private readonly table: Locator;
  private readonly tableRows: Locator;

  // Modal
  private readonly modal: Locator;
  private readonly modalCloseButton: Locator;

  // Error state
  private readonly errorMessage: Locator;
  private readonly reloadButton: Locator;

  constructor(page: Page) {
    super(page);

    // Environment filter
    this.environmentDropdown = page.locator('select').filter({ has: page.locator('option:has-text("All Environments")') });

    // Metric cards - using heading text
    this.totalDatabasesCard = page.locator('div.bg-white').filter({ hasText: 'Total Databases' }).first();
    this.nonCompliantCard = page.locator('div.bg-white').filter({ hasText: 'Non-Compliant' }).first();
    this.autoUpgradeEnabledCard = page.locator('div.bg-white').filter({ hasText: 'Auto-Upgrade Enabled' }).first();
    this.autoUpgradeDisabledCard = page.locator('div.bg-white').filter({ hasText: 'Auto-Upgrade Disabled' }).first();

    // EOL Timeline cards
    this.eolCriticalCard = page.locator('div').filter({ hasText: 'EOL Critical' });
    this.eolWarningCard = page.locator('div').filter({ hasText: 'EOL Warning' });
    this.eolSafeCard = page.locator('div').filter({ hasText: 'EOL Safe' });

    // Charts
    this.versionChart = page.locator('text="Version Distribution"').locator('..').locator('.recharts-wrapper').first();
    this.environmentChart = page.locator('text="Environment Distribution"').locator('..').locator('.recharts-wrapper').first();
    this.eolTimelineChart = page.locator('text="EOL Timeline"').locator('..').locator('.recharts-wrapper').first();

    // Table
    this.table = page.locator('table').first();
    this.tableRows = this.table.locator('tbody tr');

    // Modal
    this.modal = page.locator('div[role="dialog"], div.fixed.inset-0').first();
    this.modalCloseButton = this.modal.locator('button').filter({ has: page.locator('svg') }).first();

    // Error state
    this.errorMessage = page.getByText('No Database Data Available');
    this.reloadButton = page.getByRole('button', { name: /Reload Page/ });
  }

  // ===== Filter Methods =====

  /**
   * Select environment from dropdown
   */
  async selectEnvironment(environment: string) {
    await this.selectOption(this.environmentDropdown, environment);
    await this.page.waitForTimeout(300);
  }

  /**
   * Get currently selected environment
   */
  async getSelectedEnvironment(): Promise<string> {
    return await this.environmentDropdown.inputValue();
  }

  // ===== Metric Card Methods =====

  /**
   * Click Total Databases metric card
   */
  async clickTotalDatabasesCard() {
    await this.clickElement(this.totalDatabasesCard);
    await this.page.waitForTimeout(300);
  }

  /**
   * Click Non-Compliant metric card
   */
  async clickNonCompliantCard() {
    await this.clickElement(this.nonCompliantCard);
    await this.page.waitForTimeout(300);
  }

  /**
   * Click Auto-Upgrade Enabled card
   */
  async clickAutoUpgradeEnabledCard() {
    await this.clickElement(this.autoUpgradeEnabledCard);
    await this.page.waitForTimeout(300);
  }

  /**
   * Get Total Databases count from card
   */
  async getTotalDatabasesCount(): Promise<number> {
    const text = await this.totalDatabasesCard.locator('p.text-3xl, p.text-4xl').textContent();
    return parseInt(text?.trim() ?? '0');
  }

  /**
   * Get Non-Compliant count from card
   */
  async getNonCompliantCount(): Promise<number> {
    const text = await this.nonCompliantCard.locator('p.text-3xl, p.text-4xl').textContent();
    return parseInt(text?.trim() ?? '0');
  }

  // ===== Chart Methods =====

  /**
   * Check if Version Distribution chart is visible
   */
  async isVersionChartVisible(): Promise<boolean> {
    return await this.isVisible(this.versionChart);
  }

  /**
   * Check if Environment Distribution chart is visible
   */
  async isEnvironmentChartVisible(): Promise<boolean> {
    return await this.isVisible(this.environmentChart);
  }

  /**
   * Check if EOL Timeline chart is visible
   */
  async isEOLTimelineChartVisible(): Promise<boolean> {
    return await this.isVisible(this.eolTimelineChart);
  }

  /**
   * Click a chart bar/segment (triggers filtering)
   */
  async clickChart(chartType: 'version' | 'environment' | 'eol') {
    let chart: Locator;
    switch (chartType) {
      case 'version':
        chart = this.versionChart;
        break;
      case 'environment':
        chart = this.environmentChart;
        break;
      case 'eol':
        chart = this.eolTimelineChart;
        break;
    }

    // Click on the first bar/segment
    const chartElement = chart.locator('path, rect').first();
    await this.clickElement(chartElement);
    await this.page.waitForTimeout(300);
  }

  // ===== Table Methods =====

  /**
   * Get number of visible table rows
   */
  async getTableRowCount(): Promise<number> {
    return await this.getElementCount(this.tableRows);
  }

  /**
   * Click a table row by index (0-based)
   */
  async clickTableRow(index: number) {
    const row = this.tableRows.nth(index);
    await this.clickElement(row);
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if table is visible
   */
  async isTableVisible(): Promise<boolean> {
    return await this.isVisible(this.table);
  }

  /**
   * Get compliance badge color for a row
   */
  async getRowComplianceBadge(index: number): Promise<string> {
    const row = this.tableRows.nth(index);
    const badge = row.locator('.bg-green-100, .bg-red-100').first();
    const classList = await badge.getAttribute('class');
    return classList?.includes('bg-green-100') ? 'compliant' : 'non-compliant';
  }

  // ===== Modal Methods =====

  /**
   * Check if modal is open
   */
  async isModalOpen(): Promise<boolean> {
    return await this.isVisible(this.modal);
  }

  /**
   * Close modal using close button
   */
  async closeModal() {
    await this.clickElement(this.modalCloseButton);
    await this.waitForElementHidden(this.modal);
  }

  // ===== Error State Methods =====

  /**
   * Check if error message is displayed
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }

  /**
   * Click reload button in error state
   */
  async clickReloadButton() {
    await this.clickElement(this.reloadButton);
  }

  // ===== Helper Methods =====

  /**
   * Wait for dashboard to be fully loaded
   */
  async waitForDashboardLoad() {
    await this.waitForElement(this.totalDatabasesCard);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Assert dashboard is visible and loaded
   */
  async assertDashboardVisible() {
    await this.assertVisible(this.totalDatabasesCard, 'Total Databases card should be visible');
  }

  /**
   * Reset filters to default state
   */
  async resetFilters() {
    await this.selectEnvironment('All');
    await this.page.waitForTimeout(500);
  }
}
