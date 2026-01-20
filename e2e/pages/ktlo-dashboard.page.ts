import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for the KTLO Dashboard.
 * Handles all interactions with the KTLO Tasks dashboard including
 * filters, metrics, charts, tables, and modals.
 */
export class KtloDashboardPage extends BasePage {
  // Search and Filter locators
  private readonly searchInput: Locator;
  private readonly fiscalYearDropdown: Locator;
  private readonly podOwnerDropdown: Locator;
  private readonly completedCheckbox: Locator;
  private readonly inProgressCheckbox: Locator;
  private readonly notStartedCheckbox: Locator;

  // Alert Banner
  private readonly alertBanner: Locator;

  // Metric Cards
  private readonly totalTasksCard: Locator;
  private readonly triagedCard: Locator;
  private readonly ccsActionCard: Locator;
  private readonly completedCard: Locator;

  // Timeline/Urgency Cards
  private readonly overdueCard: Locator;
  private readonly due7DaysCard: Locator;
  private readonly due30DaysCard: Locator;
  private readonly due90DaysCard: Locator;

  // Charts
  private readonly statusChart: Locator;
  private readonly triageChart: Locator;
  private readonly podOwnerChart: Locator;

  // Table
  private readonly table: Locator;
  private readonly tableRows: Locator;

  // Modals
  private readonly modal: Locator;
  private readonly modalTitle: Locator;
  private readonly modalCloseButton: Locator;
  private readonly drillDownModal: Locator;
  private readonly detailModal: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize Search and Filter locators
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.fiscalYearDropdown = page.locator('select').filter({ hasText: /FY\d{2}/ }).first();
    this.podOwnerDropdown = page.locator('select').filter({ has: page.locator('option:has-text("All Pod Owners")') });

    // Status checkboxes - find by associated label text
    this.completedCheckbox = page.locator('label:has-text("Completed") input[type="checkbox"]');
    this.inProgressCheckbox = page.locator('label:has-text("In Progress") input[type="checkbox"]');
    this.notStartedCheckbox = page.locator('label:has-text("Not Started") input[type="checkbox"]');

    // Alert Banner
    this.alertBanner = page.locator('div.bg-red-50.border-red-200').filter({ hasText: /overdue/ });

    // Metric Cards - using heading text
    this.totalTasksCard = page.locator('div.bg-white').filter({ hasText: 'Total Tasks' }).first();
    this.triagedCard = page.locator('div.bg-white').filter({ hasText: 'Triaged' }).first();
    this.ccsActionCard = page.locator('div.bg-white').filter({ hasText: 'CCS Action' }).first();
    this.completedCard = page.locator('div.bg-white').filter({ hasText: /^Completed/ }).first();

    // Timeline Cards - use more specific locators
    this.overdueCard = page.locator('div.bg-gradient-to-br.from-red-50').filter({ hasText: 'Overdue' });
    this.due7DaysCard = page.locator('div.bg-gradient-to-br.from-orange-50').filter({ hasText: 'Due in 7 Days' });
    this.due30DaysCard = page.locator('div.bg-gradient-to-br.from-yellow-50').filter({ hasText: 'Due in 30 Days' });
    this.due90DaysCard = page.locator('div.bg-gradient-to-br.from-blue-50').filter({ hasText: 'Due in 90 Days' });

    // Charts - Recharts renders SVG elements
    this.statusChart = page.locator('text="Status Distribution"').locator('..').locator('.recharts-wrapper').first();
    this.triageChart = page.locator('text="Triage Status"').locator('..').locator('.recharts-wrapper').first();
    this.podOwnerChart = page.locator('text="Pod Owner Distribution"').locator('..').locator('.recharts-wrapper').first();

    // Table
    this.table = page.locator('table').first();
    this.tableRows = this.table.locator('tbody tr');

    // Modals
    this.modal = page.locator('div.fixed.inset-0.bg-slate-900\\/50').first();
    this.modalTitle = this.modal.locator('h2, h3').first();
    this.modalCloseButton = this.modal.locator('button').first();

    // Specific modal types
    this.drillDownModal = page.locator('div.fixed.inset-0').filter({ hasText: /All KTLO Tasks|Triaged Tasks|CCS Action|Completed Tasks|Overdue|Due in/ });
    this.detailModal = page.locator('div.fixed.inset-0').filter({ hasText: /KTLO Item|Due Date|Status|Triaged/ });
  }

  // ===== Search and Filter Methods =====

  /**
   * Enter search term in the search input
   */
  async search(term: string) {
    await this.fillInput(this.searchInput, term);
    // Wait for search to apply (debounced)
    await this.page.waitForTimeout(500);
  }

  /**
   * Clear search input
   */
  async clearSearch() {
    await this.fillInput(this.searchInput, '');
    await this.page.waitForTimeout(500);
  }

  /**
   * Get current search term
   */
  async getSearchTerm(): Promise<string> {
    return await this.searchInput.inputValue();
  }

  /**
   * Select fiscal year from dropdown
   */
  async selectFiscalYear(year: string) {
    await this.selectOption(this.fiscalYearDropdown, year);
    await this.page.waitForTimeout(300);
  }

  /**
   * Select pod owner from dropdown
   */
  async selectPodOwner(owner: string) {
    await this.selectOption(this.podOwnerDropdown, owner);
    await this.page.waitForTimeout(300);
  }

  /**
   * Toggle the Completed status filter
   */
  async toggleCompletedFilter() {
    await this.clickElement(this.completedCheckbox);
    await this.page.waitForTimeout(300);
  }

  /**
   * Toggle the In Progress status filter
   */
  async toggleInProgressFilter() {
    await this.clickElement(this.inProgressCheckbox);
    await this.page.waitForTimeout(300);
  }

  /**
   * Toggle the Not Started status filter
   */
  async toggleNotStartedFilter() {
    await this.clickElement(this.notStartedCheckbox);
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if Completed filter is checked
   */
  async isCompletedFilterChecked(): Promise<boolean> {
    return await this.completedCheckbox.isChecked();
  }

  /**
   * Check if In Progress filter is checked
   */
  async isInProgressFilterChecked(): Promise<boolean> {
    return await this.inProgressCheckbox.isChecked();
  }

  /**
   * Check if Not Started filter is checked
   */
  async isNotStartedFilterChecked(): Promise<boolean> {
    return await this.notStartedCheckbox.isChecked();
  }

  // ===== Alert Banner Methods =====

  /**
   * Check if alert banner is visible
   */
  async isAlertBannerVisible(): Promise<boolean> {
    return await this.isVisible(this.alertBanner);
  }

  /**
   * Click alert banner to open drill-down
   */
  async clickAlertBanner() {
    await this.clickElement(this.alertBanner);
    await this.page.waitForTimeout(300);
  }

  /**
   * Get alert banner text
   */
  async getAlertBannerText(): Promise<string> {
    return await this.getTextContent(this.alertBanner);
  }

  // ===== Metric Card Methods =====

  /**
   * Click Total Tasks metric card
   */
  async clickTotalTasksCard() {
    await this.clickElement(this.totalTasksCard);
    await this.page.waitForTimeout(300);
  }

  /**
   * Click Triaged metric card
   */
  async clickTriagedCard() {
    await this.clickElement(this.triagedCard);
    await this.page.waitForTimeout(300);
  }

  /**
   * Click CCS Action metric card
   */
  async clickCCSActionCard() {
    await this.clickElement(this.ccsActionCard);
    await this.page.waitForTimeout(300);
  }

  /**
   * Click Completed metric card
   */
  async clickCompletedMetricCard() {
    await this.clickElement(this.completedCard);
    await this.page.waitForTimeout(300);
  }

  /**
   * Get Total Tasks count from card
   */
  async getTotalTasksCount(): Promise<number> {
    const text = await this.totalTasksCard.locator('p.text-3xl').textContent();
    return parseInt(text?.trim() ?? '0');
  }

  /**
   * Get Triaged count from card
   */
  async getTriagedCount(): Promise<number> {
    const text = await this.triagedCard.locator('p.text-3xl').textContent();
    return parseInt(text?.trim() ?? '0');
  }

  /**
   * Get CCS Action count from card
   */
  async getCCSActionCount(): Promise<number> {
    const text = await this.ccsActionCard.locator('p.text-3xl').textContent();
    return parseInt(text?.trim() ?? '0');
  }

  /**
   * Get Completed count from card
   */
  async getCompletedCount(): Promise<number> {
    const text = await this.completedCard.locator('p.text-3xl').textContent();
    return parseInt(text?.trim() ?? '0');
  }

  // ===== Timeline/Urgency Card Methods =====

  /**
   * Click Overdue card
   */
  async clickOverdueCard() {
    await this.clickElement(this.overdueCard);
    await this.page.waitForTimeout(300);
  }

  /**
   * Click Due in 7 Days card
   */
  async clickDue7DaysCard() {
    await this.clickElement(this.due7DaysCard);
    await this.page.waitForTimeout(300);
  }

  /**
   * Click Due in 30 Days card
   */
  async clickDue30DaysCard() {
    await this.clickElement(this.due30DaysCard);
    await this.page.waitForTimeout(300);
  }

  /**
   * Click Due in 90 Days card
   */
  async clickDue90DaysCard() {
    await this.clickElement(this.due90DaysCard);
    await this.page.waitForTimeout(300);
  }

  /**
   * Get Overdue count from card
   */
  async getOverdueCount(): Promise<number> {
    const text = await this.overdueCard.locator('span.text-3xl').textContent();
    return parseInt(text?.trim() ?? '0');
  }

  // ===== Chart Methods =====

  /**
   * Check if Status Distribution chart is visible
   */
  async isStatusChartVisible(): Promise<boolean> {
    return await this.isVisible(this.statusChart);
  }

  /**
   * Check if Triage Status chart is visible
   */
  async isTriageChartVisible(): Promise<boolean> {
    return await this.isVisible(this.triageChart);
  }

  /**
   * Check if Pod Owner chart is visible
   */
  async isPodOwnerChartVisible(): Promise<boolean> {
    return await this.isVisible(this.podOwnerChart);
  }

  /**
   * Click a chart (triggers drill-down)
   * Note: Clicking pie chart segments requires clicking on the SVG path elements
   */
  async clickChart(chartType: 'status' | 'triage' | 'podOwner') {
    let chart: Locator;
    switch (chartType) {
      case 'status':
        chart = this.statusChart;
        break;
      case 'triage':
        chart = this.triageChart;
        break;
      case 'podOwner':
        chart = this.podOwnerChart;
        break;
    }

    // Click on the first pie segment (path element in SVG)
    const pieSegment = chart.locator('path').first();
    await this.clickElement(pieSegment);
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
   * Get table row text by index
   */
  async getTableRowText(index: number): Promise<string> {
    const row = this.tableRows.nth(index);
    return await this.getTextContent(row);
  }

  /**
   * Check if table is visible
   */
  async isTableVisible(): Promise<boolean> {
    return await this.isVisible(this.table);
  }

  // ===== Modal Methods =====

  /**
   * Check if modal is open
   */
  async isModalOpen(): Promise<boolean> {
    return await this.isVisible(this.modal);
  }

  /**
   * Get modal title
   */
  async getModalTitle(): Promise<string> {
    return await this.getTextContent(this.modalTitle);
  }

  /**
   * Close modal using close button
   */
  async closeModal() {
    await this.clickElement(this.modalCloseButton);
    await this.waitForElementHidden(this.modal);
  }

  /**
   * Close modal using Escape key
   */
  async closeModalWithEscape() {
    await this.pressKey('Escape');
    await this.waitForElementHidden(this.modal);
  }

  /**
   * Close modal by clicking outside (backdrop click)
   */
  async closeModalByClickingOutside() {
    // Click on the modal backdrop (fixed overlay)
    const backdrop = this.page.locator('div.fixed.inset-0.bg-black.bg-opacity-50').first();
    await backdrop.click({ position: { x: 10, y: 10 } });
    await this.waitForElementHidden(this.modal);
  }

  /**
   * Get count of items in drill-down modal
   */
  async getDrillDownItemCount(): Promise<number> {
    const items = this.drillDownModal.locator('div').filter({ hasText: /KTLO Item/ });
    return await this.getElementCount(items);
  }

  /**
   * Check if drill-down modal is open
   */
  async isDrillDownModalOpen(): Promise<boolean> {
    return await this.isVisible(this.drillDownModal);
  }

  /**
   * Check if detail modal is open
   */
  async isDetailModalOpen(): Promise<boolean> {
    return await this.isVisible(this.detailModal);
  }

  // ===== Helper Methods =====

  /**
   * Wait for dashboard to be fully loaded
   */
  async waitForDashboardLoad() {
    await this.waitForElement(this.searchInput);
    await this.waitForElement(this.totalTasksCard);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Assert dashboard is visible and loaded
   */
  async assertDashboardVisible() {
    await this.assertVisible(this.searchInput, 'Search input should be visible');
    await this.assertVisible(this.totalTasksCard, 'Total Tasks card should be visible');
  }

  /**
   * Reset all filters to default state
   */
  async resetFilters() {
    await this.clearSearch();
    await this.selectFiscalYear('FY26');
    await this.selectPodOwner('All');

    // Ensure all status checkboxes are checked
    if (!await this.isCompletedFilterChecked()) {
      await this.toggleCompletedFilter();
    }
    if (!await this.isInProgressFilterChecked()) {
      await this.toggleInProgressFilter();
    }
    if (!await this.isNotStartedFilterChecked()) {
      await this.toggleNotStartedFilter();
    }

    await this.page.waitForTimeout(500);
  }
}
