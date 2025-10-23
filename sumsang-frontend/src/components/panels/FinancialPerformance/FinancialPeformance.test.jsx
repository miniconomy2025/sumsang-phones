import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import FinancialPerformance from './FinancialPerformance';
import { getFinancialData } from '../../../api/dataFetcher';
import { usePollingFetch } from '../../../hooks/usePollingFetch';

// Mock dependencies
vi.mock('../../../api/dataFetcher');
vi.mock('../../../hooks/usePollingFetch');
vi.mock('./charts/TotalRevenueChart', () => ({
  default: ({ data }) => <div data-testid="total-revenue-chart">TotalRevenueChart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/NetProfitChart', () => ({
  default: ({ data }) => <div data-testid="net-profit-chart">NetProfitChart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/TotalExpensesChart', () => ({
  default: ({ data }) => <div data-testid="total-expenses-chart">TotalExpensesChart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/CostVsSellingPriceChart', () => ({
  default: ({ data }) => <div data-testid="cost-vs-selling-chart">CostVsSellingPriceChart: {JSON.stringify(data)}</div>
}));

describe('FinancialPerformance', () => {
  const mockData = {
    totalRevenue: 200000,
    netProfit: 50000,
    totalExpenses: 150000,
    costVsSelling: 1.2
  };

  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  describe('Loading State', () => {
    it('should display loading message when fetching data', () => {
      usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
      render(<FinancialPerformance />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not render charts while loading', () => {
      usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
      const { container } = render(<FinancialPerformance />);
      const sections = container.querySelectorAll('section');
      expect(sections).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should display error message when there is an error', () => {
      usePollingFetch.mockReturnValue({ data: null, loading: false, error: 'Failed to fetch financial data' });
      render(<FinancialPerformance />);
      expect(screen.getByText('Failed to fetch financial data')).toBeInTheDocument();
    });

    it('should not render sections when there is an error', () => {
      usePollingFetch.mockReturnValue({ data: null, loading: false, error: 'Failed to fetch financial data' });
      const { container } = render(<FinancialPerformance />);
      const sections = container.querySelectorAll('section');
      expect(sections).toHaveLength(0);
    });
  });

  describe('Successful Data Loading', () => {
    it('should render all charts when data loads successfully', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      const { container } = render(<FinancialPerformance />);
      const sections = container.querySelectorAll('section');
      expect(sections).toHaveLength(4);
    });

    it('should pass data correctly to all charts', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      render(<FinancialPerformance />);
      expect(screen.getByTestId('total-revenue-chart').textContent).toContain(JSON.stringify(mockData));
      expect(screen.getByTestId('net-profit-chart').textContent).toContain(JSON.stringify(mockData));
      expect(screen.getByTestId('total-expenses-chart').textContent).toContain(JSON.stringify(mockData));
      expect(screen.getByTestId('cost-vs-selling-chart').textContent).toContain(JSON.stringify(mockData));
    });

    it('should not show error banner when there is no error', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      const { container } = render(<FinancialPerformance />);
      const banner = container.querySelector('[class*="errorBanner"]');
      expect(banner).not.toBeInTheDocument();
    });
  });

  describe('Structure & Styling', () => {
    it('should render main container with correct classes', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      const { container } = render(<FinancialPerformance />);
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main.className).toMatch(/grid-container/);
      expect(main.className).toMatch(/gridContainer/);
    });

    it('should render sections with correct class names', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      const { container } = render(<FinancialPerformance />);
      const sections = container.querySelectorAll('section');
      expect(sections[0].className).toMatch(/totalRevenue/);
      expect(sections[1].className).toMatch(/netProfit/);
      expect(sections[2].className).toMatch(/totalExpenses/);
      expect(sections[3].className).toMatch(/costVsSelling/);
    });
  });

  describe('Hook Integration', () => {
    it('should call usePollingFetch with correct parameters', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      render(<FinancialPerformance />);
      expect(usePollingFetch).toHaveBeenCalledWith(getFinancialData, 15000);
    });
  });

  describe('State Transitions', () => {
    it('should transition from loading to loaded', async () => {
      usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
      const { rerender, container } = render(<FinancialPerformance />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      rerender(<FinancialPerformance />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        const sections = container.querySelectorAll('section');
        expect(sections).toHaveLength(4);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data object', () => {
      usePollingFetch.mockReturnValue({ data: {}, loading: false, error: null });
      const { container } = render(<FinancialPerformance />);
      const sections = container.querySelectorAll('section');
      expect(sections).toHaveLength(4);
    });

    it('should handle empty string error', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: '' });
      const { container } = render(<FinancialPerformance />);
      const banner = container.querySelector('[class*="errorBanner"]');
      expect(banner).not.toBeInTheDocument();
    });
  });
});
