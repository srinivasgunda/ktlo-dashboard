import { describe, it, expect } from 'vitest';

// Import utility functions (we'll extract them to a separate file)
// For now, we'll define them here for testing

const excelDateToJSDate = (excelDate: number): Date => {
  return new Date((excelDate - 25569) * 86400 * 1000);
};

const formatDate = (excelDate: number | string): string => {
  if (typeof excelDate === 'string') return excelDate;
  const date = excelDateToJSDate(excelDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const extractJiraId = (comments?: string): string | null => {
  if (!comments) return null;
  const jiraMatch = comments.match(/(?:GWCP|RE|BITS)-\d+/i);
  return jiraMatch ? jiraMatch[0] : null;
};

const getFiscalYear = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month >= 7) {
    return `FY${(year + 1).toString().slice(-2)}`;
  }
  return `FY${year.toString().slice(-2)}`;
};

describe('Utility Functions', () => {
  describe('excelDateToJSDate', () => {
    it('should convert Excel date number to JavaScript Date', () => {
      // Excel date 44927 = January 1, 2023
      const result = excelDateToJSDate(44927);
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(0); // January = 0
    });

    it('should handle different Excel dates correctly', () => {
      // Excel date 45292 = January 1, 2024
      const result = excelDateToJSDate(45292);
      expect(result.getFullYear()).toBe(2024);
    });
  });

  describe('formatDate', () => {
    it('should return string date as-is', () => {
      const dateString = '2024-01-15';
      expect(formatDate(dateString)).toBe(dateString);
    });

    it('should format Excel date number to readable format', () => {
      // Excel date 44927 = January 1, 2023
      const result = formatDate(44927);
      expect(result).toMatch(/Jan|January/);
      expect(result).toContain('2023');
    });

    it('should handle various date formats', () => {
      const result = formatDate(45292); // Jan 1, 2024
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('extractJiraId', () => {
    it('should extract GWCP Jira ID from comments', () => {
      const comments = 'This is related to GWCP-12345';
      expect(extractJiraId(comments)).toBe('GWCP-12345');
    });

    it('should extract RE Jira ID from comments', () => {
      const comments = 'See RE-9876 for details';
      expect(extractJiraId(comments)).toBe('RE-9876');
    });

    it('should extract BITS Jira ID from comments', () => {
      const comments = 'Tracked in BITS-5432';
      expect(extractJiraId(comments)).toBe('BITS-5432');
    });

    it('should return null when no Jira ID is found', () => {
      const comments = 'No ticket reference here';
      expect(extractJiraId(comments)).toBeNull();
    });

    it('should return null when comments are undefined', () => {
      expect(extractJiraId(undefined)).toBeNull();
    });

    it('should return null when comments are empty', () => {
      expect(extractJiraId('')).toBeNull();
    });

    it('should be case insensitive', () => {
      expect(extractJiraId('gwcp-123')).toBe('gwcp-123');
      expect(extractJiraId('GWCP-456')).toBe('GWCP-456');
    });
  });

  describe('getFiscalYear', () => {
    it('should return correct fiscal year for dates in Aug-Dec', () => {
      // August 2024 should be FY25
      const date = new Date('2024-08-15');
      expect(getFiscalYear(date)).toBe('FY25');
    });

    it('should return correct fiscal year for dates in Jan-Jul', () => {
      // March 2024 should be FY24
      const date = new Date('2024-03-15');
      expect(getFiscalYear(date)).toBe('FY24');
    });

    it('should handle fiscal year boundary correctly', () => {
      // July 31, 2024 should be FY24
      const julyDate = new Date('2024-07-31');
      expect(getFiscalYear(julyDate)).toBe('FY24');

      // August 1, 2024 should be FY25
      const augDate = new Date('2024-08-01');
      expect(getFiscalYear(augDate)).toBe('FY25');
    });

    it('should format year correctly as two digits', () => {
      const date = new Date('2024-09-01');
      const fy = getFiscalYear(date);
      expect(fy).toMatch(/^FY\d{2}$/);
      expect(fy.length).toBe(4);
    });
  });
});
