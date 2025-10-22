import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ProductionOverview from './ProductionOverview';
import { getProductionData } from '../../../api/dataFetcher';
import { usePollingFetch } from '../../../hooks/usePollingFetch';

// Mock the dependencies
vi.mock('../../../api/dataFetcher');
vi.mock('../../../hooks/usePollingFetch');
vi.mock('./charts/TotalPhonesProducedChart', () => ({
	default: ({ data }) => <div data-testid="total-phones-chart">Total Phones Chart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/ProductionCapacityChart', () => ({
	default: ({ data }) => <div data-testid="production-capacity-chart">Production Capacity Chart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/CostBreakdownChart', () => ({
	default: ({ data }) => <div data-testid="cost-breakdown-chart">Cost Breakdown Chart: {JSON.stringify(data)}</div>
}));

describe('ProductionOverview', () => {
	const mockData = {
		totalPhones: 1000,
		capacity: 80,
		costs: {
			labor: 50000,
			materials: 75000,
			overhead: 25000
		}
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Loading State', () => {
		it('should display loading message when data is loading', () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: true,
				error: null
			});

			render(<ProductionOverview />);

			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('should not render charts while loading', () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: true,
				error: null
			});

			render(<ProductionOverview />);

			expect(screen.queryByTestId('total-phones-chart')).not.toBeInTheDocument();
			expect(screen.queryByTestId('cost-breakdown-chart')).not.toBeInTheDocument();
		});
	});

	describe('Error Handling', () => {
		it('should display "Failed to fetch" message for fetch errors', () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: false,
				error: 'Failed to fetch'
			});

			render(<ProductionOverview />);

			expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
		});

		it('should not render charts when there is a fetch error', () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: false,
				error: 'Failed to fetch'
			});

			render(<ProductionOverview />);

			expect(screen.queryByTestId('total-phones-chart')).not.toBeInTheDocument();
			expect(screen.queryByTestId('cost-breakdown-chart')).not.toBeInTheDocument();
		});

		it('should display error banner for non-fetch errors', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: 'API rate limit exceeded'
			});

			render(<ProductionOverview />);

			const errorBanner = screen.getByText('API rate limit exceeded');
			expect(errorBanner).toBeInTheDocument();
			expect(errorBanner.className).toMatch(/errorBanner/);
		});

		it('should render charts even when there is a non-fetch error', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: 'Warning: Stale data'
			});

			render(<ProductionOverview />);

			expect(screen.getByTestId('total-phones-chart')).toBeInTheDocument();
			expect(screen.getByTestId('cost-breakdown-chart')).toBeInTheDocument();
		});
	});

	describe('Successful Data Loading', () => {
		it('should render all charts when data is loaded successfully', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			render(<ProductionOverview />);

			expect(screen.getByTestId('total-phones-chart')).toBeInTheDocument();
			expect(screen.getByTestId('cost-breakdown-chart')).toBeInTheDocument();
		});

		it('should pass data to TotalPhonesProducedChart', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			render(<ProductionOverview />);

			const chart = screen.getByTestId('total-phones-chart');
			expect(chart.textContent).toContain(JSON.stringify(mockData));
		});

		it('should pass data to CostBreakdownChart', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			render(<ProductionOverview />);

			const chart = screen.getByTestId('cost-breakdown-chart');
			expect(chart.textContent).toContain(JSON.stringify(mockData));
		});

		it('should not display error banner when there is no error', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			render(<ProductionOverview />);

			expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
		});

		it('should render main container with correct classes', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			const { container } = render(<ProductionOverview />);

			const mainElement = container.querySelector('main');
			expect(mainElement).toBeInTheDocument();
			expect(mainElement.className).toMatch(/grid-container/);
			expect(mainElement.className).toMatch(/gridContainer/);
		});

		it('should render sections with correct classes', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			const { container } = render(<ProductionOverview />);

			const sections = container.querySelectorAll('section');
			expect(sections).toHaveLength(2);
			
			sections.forEach(section => {
				expect(section.className).toMatch(/grid-panel/);
			});

			expect(sections[0].className).toMatch(/phonesProduced/);
			expect(sections[1].className).toMatch(/costBreakdown/);
		});
	});

	describe('usePollingFetch Hook Integration', () => {
		it('should call usePollingFetch with correct parameters', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			render(<ProductionOverview />);

			expect(usePollingFetch).toHaveBeenCalledWith(getProductionData, 15000);
			expect(usePollingFetch).toHaveBeenCalledTimes(1);
		});

		it('should handle undefined data gracefully', () => {
			usePollingFetch.mockReturnValue({
				data: undefined,
				loading: false,
				error: null
			});

			render(<ProductionOverview />);

			expect(screen.getByTestId('total-phones-chart')).toBeInTheDocument();
			expect(screen.getByTestId('cost-breakdown-chart')).toBeInTheDocument();
		});

		it('should handle null data gracefully', () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: false,
				error: null
			});

			render(<ProductionOverview />);

			expect(screen.getByTestId('total-phones-chart')).toBeInTheDocument();
			expect(screen.getByTestId('cost-breakdown-chart')).toBeInTheDocument();
		});
	});

	describe('State Transitions', () => {
		it('should transition from loading to loaded state', async () => {
			// Initial loading state
			usePollingFetch.mockReturnValue({
				data: null,
				loading: true,
				error: null
			});
			
			const { rerender } = render(<ProductionOverview />);
			expect(screen.getByText('Loading...')).toBeInTheDocument();

			// Loaded state
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});
			rerender(<ProductionOverview />);

			await waitFor(() => {
				expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
				expect(screen.getByTestId('total-phones-chart')).toBeInTheDocument();
			});
		});

		it('should transition from loading to error state', async () => {
			// Initial loading state
			usePollingFetch.mockReturnValue({
				data: null,
				loading: true,
				error: null
			});
			
			const { rerender } = render(<ProductionOverview />);
			expect(screen.getByText('Loading...')).toBeInTheDocument();

			// Error state
			usePollingFetch.mockReturnValue({
				data: null,
				loading: false,
				error: 'Failed to fetch'
			});
			rerender(<ProductionOverview />);

			await waitFor(() => {
				expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
				expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
			});
		});

		it('should recover from error state to loaded state', async () => {
			// Error state
			usePollingFetch.mockReturnValue({
				data: null,
				loading: false,
				error: 'Failed to fetch'
			});
			
			const { rerender } = render(<ProductionOverview />);
			expect(screen.getByText('Failed to fetch')).toBeInTheDocument();

			// Recovered state
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});
			rerender(<ProductionOverview />);

			await waitFor(() => {
				expect(screen.queryByText('Failed to fetch')).not.toBeInTheDocument();
				expect(screen.getByTestId('total-phones-chart')).toBeInTheDocument();
			});
		});
	});

	describe('Data Updates', () => {
		it('should update charts when data changes', async () => {
			// Initial data
			const initialData = { totalPhones: 500 };
			usePollingFetch.mockReturnValue({
				data: initialData,
				loading: false,
				error: null
			});
			
			const { rerender } = render(<ProductionOverview />);

			expect(screen.getByTestId('total-phones-chart').textContent).toContain(
				JSON.stringify(initialData)
			);

			// Updated data
			const updatedData = { totalPhones: 1000 };
			usePollingFetch.mockReturnValue({
				data: updatedData,
				loading: false,
				error: null
			});
			rerender(<ProductionOverview />);

			await waitFor(() => {
				expect(screen.getByTestId('total-phones-chart').textContent).toContain(
					JSON.stringify(updatedData)
				);
			});
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty data object', () => {
			usePollingFetch.mockReturnValue({
				data: {},
				loading: false,
				error: null
			});

			render(<ProductionOverview />);

			expect(screen.getByTestId('total-phones-chart')).toBeInTheDocument();
			expect(screen.getByTestId('cost-breakdown-chart')).toBeInTheDocument();
		});

		it('should handle empty string error', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: ''
			});

			const { container } = render(<ProductionOverview />);

			// Empty string is falsy, so no error banner should show
			const errorBanner = container.querySelector('[class*="errorBanner"]');
			expect(errorBanner).not.toBeInTheDocument();
			expect(screen.getByTestId('total-phones-chart')).toBeInTheDocument();
		});

		it('should handle simultaneous loading and error (edge case)', () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: true,
				error: 'Some error'
			});

			render(<ProductionOverview />);

			// Loading state takes precedence
			expect(screen.getByText('Loading...')).toBeInTheDocument();
			expect(screen.queryByTestId('total-phones-chart')).not.toBeInTheDocument();
		});
	});
});