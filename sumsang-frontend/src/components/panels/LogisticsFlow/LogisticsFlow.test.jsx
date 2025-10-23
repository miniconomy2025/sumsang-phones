import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import LogisticsFlow from './LogisticsFlow';
import { getLogisticsData } from '../../../api/dataFetcher';
import { usePollingFetch } from '../../../hooks/usePollingFetch';

// Mock dependencies
vi.mock('../../../api/dataFetcher');
vi.mock('../../../hooks/usePollingFetch');
vi.mock('./charts/TransfersInChart', () => ({
  default: ({ data }) => <div data-testid="transfers-in-chart">TransfersInChart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/TransfersOutChart', () => ({
  default: ({ data }) => <div data-testid="transfers-out-chart">TransfersOutChart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/TransfersInCostChart', () => ({
  default: ({ data }) => <div data-testid="transfers-in-cost-chart">TransfersInCostChart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/TransfersOutCostChart', () => ({
  default: ({ data }) => <div data-testid="transfers-out-cost-chart">TransfersOutCostChart: {JSON.stringify(data)}</div>
}));

describe('LogisticsFlow', () => {
  const mockData = {
    transfersIn: 100,
    transfersOut: 80,
    transfersInCost: 5000,
    transfersOutCost: 4000
  };

  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  describe('Loading State', () => {
    it('should display loading message when fetching data', () => {
      usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
      render(<LogisticsFlow />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not render charts while loading', () => {
      usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
      const { container } = render(<LogisticsFlow />);
      const sections = container.querySelectorAll('section');
      expect(sections).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should display error message when there is an error', () => {
      usePollingFetch.mockReturnValue({ data: null, loading: false, error: 'Failed to fetch logistics' });
      render(<LogisticsFlow />);
      expect(screen.getByText('Failed to fetch logistics')).toBeInTheDocument();
    });

    it('should not render sections when there is an error', () => {
      usePollingFetch.mockReturnValue({ data: null, loading: false, error: 'Failed to fetch logistics' });
      const { container } = render(<LogisticsFlow />);
      const sections = container.querySelectorAll('section');
      expect(sections).toHaveLength(0);
    });
  });

  describe('Successful Data Loading', () => {
    it('should render all charts when data loads successfully', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      const { container } = render(<LogisticsFlow />);
      const sections = container.querySelectorAll('section');
      expect(sections).toHaveLength(4);
    });

    it('should pass data correctly to all charts', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      render(<LogisticsFlow />);
      expect(screen.getByTestId('transfers-in-chart').textContent).toContain(JSON.stringify(mockData));
      expect(screen.getByTestId('transfers-out-chart').textContent).toContain(JSON.stringify(mockData));
      expect(screen.getByTestId('transfers-in-cost-chart').textContent).toContain(JSON.stringify(mockData));
      expect(screen.getByTestId('transfers-out-cost-chart').textContent).toContain(JSON.stringify(mockData));
    });

    it('should not show error banner when there is no error', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      const { container } = render(<LogisticsFlow />);
      const banner = container.querySelector('[class*="errorBanner"]');
      expect(banner).not.toBeInTheDocument();
    });
  });

  describe('Structure & Styling', () => {
    it('should render main container with correct classes', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      const { container } = render(<LogisticsFlow />);
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main.className).toMatch(/grid-container/);
      expect(main.className).toMatch(/gridContainer/);
    });

    it('should render sections with correct class names', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      const { container } = render(<LogisticsFlow />);
      const sections = container.querySelectorAll('section');
      expect(sections[0].className).toMatch(/transfersIn/);
      expect(sections[1].className).toMatch(/transfersOut/);
      expect(sections[2].className).toMatch(/transfersInCost/);
      expect(sections[3].className).toMatch(/transfersOutCost/);
    });
  });

  describe('Hook Integration', () => {
    it('should call usePollingFetch with correct parameters', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      render(<LogisticsFlow />);
      expect(usePollingFetch).toHaveBeenCalledWith(getLogisticsData, 15000);
    });
  });

  describe('State Transitions', () => {
    it('should transition from loading to loaded', async () => {
      usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
      const { rerender, container } = render(<LogisticsFlow />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
      rerender(<LogisticsFlow />);

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
      const { container } = render(<LogisticsFlow />);
      const sections = container.querySelectorAll('section');
      expect(sections).toHaveLength(4);
    });

    it('should handle empty string error', () => {
      usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: '' });
      const { container } = render(<LogisticsFlow />);
      const banner = container.querySelector('[class*="errorBanner"]');
      expect(banner).not.toBeInTheDocument();
    });
  });
});
