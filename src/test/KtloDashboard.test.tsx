import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock the data imports
vi.mock('../ktlo-data.json', () => ({
  default: [
    {
      'KTLO Item': 'Test Task 1',
      'Received On': 45292,
      'Triaged': 'Yes',
      'Action Needed from CCS': 'Yes',
      'Status': 'Completed',
      'PgM Assigned': 'John Doe',
      'Due Date': 45350,
      'Comments': 'Test comment GWCP-123'
    },
    {
      'KTLO Item': 'Test Task 2',
      'Received On': 45293,
      'Triaged': 'No',
      'Action Needed from CCS': 'No',
      'Status': 'In Progress',
      'PgM Assigned': 'Jane Smith',
      'Due Date': 45400,
      'Comments': 'Another test'
    }
  ]
}));

describe('KtloDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render error state when data is missing', async () => {
    // Mock empty data
    vi.resetModules();
    vi.doMock('../ktlo-data.json', () => ({ default: [] }));

    const { default: KtloDashboard } = await import('../KtloDashboard');
    render(<KtloDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/No Data Available/i)).toBeInTheDocument();
    });
  });

  it('should display reload button in error state', async () => {
    vi.resetModules();
    vi.doMock('../ktlo-data.json', () => ({ default: [] }));

    const { default: KtloDashboard } = await import('../KtloDashboard');
    render(<KtloDashboard />);

    await waitFor(() => {
      const reloadButton = screen.getByRole('button', { name: /Reload Page/i });
      expect(reloadButton).toBeInTheDocument();
    });
  });

  it('should show helpful instructions when data is missing', async () => {
    vi.resetModules();
    vi.doMock('../ktlo-data.json', () => ({ default: [] }));

    const { default: KtloDashboard } = await import('../KtloDashboard');
    render(<KtloDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/node extract-data.js/i)).toBeInTheDocument();
      expect(screen.getByText(/ktlo-data.json/i)).toBeInTheDocument();
    });
  });
});

describe('KtloDashboard with valid data', () => {
  // Note: Due to the complexity of the dashboard and the way data is imported,
  // full integration tests would require more sophisticated mocking.
  // These tests serve as a starting point and should be expanded.

  it('should handle data import gracefully', () => {
    // This is a smoke test to ensure the module can be imported
    expect(() => require('../KtloDashboard')).not.toThrow();
  });
});
