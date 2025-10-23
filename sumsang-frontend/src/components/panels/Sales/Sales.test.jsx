import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Sales from './Sales';
import { getSalesData } from '../../../api/dataFetcher';
import { usePollingFetch } from '../../../hooks/usePollingFetch';

// Mock dependencies
vi.mock('../../../api/dataFetcher');
vi.mock('../../../hooks/usePollingFetch');
vi.mock('./charts/UnitsSoldChart', () => ({
	default: ({ data }) => <div data-testid="units-sold-chart">Units Sold Chart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/RevenueChart', () => ({
	default: ({ data }) => <div data-testid="revenue-chart">Revenue Chart: {JSON.stringify(data)}</div>
}));

describe('Sales', () => {
	const mockData = {
		unitsSold: 3200,
		revenue: 150000,
		profitMargin: 0.25
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Loading State', () => {
		it('should display loading message when fetching data', () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: true,
				error: null
			});

			render(<Sales />);

			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('should not render charts while loading', () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: true,
				error: null
			});

			render(<Sales />);

			expect(screen.queryByTestId('units-sold-chart')).not.toBeInTheDocument();
			expect(screen.queryByTestId('revenue-chart')).not.toBeInTheDocument();
		});
	});

	describe('Error Handling', () => {
        it('should display error message when there is an error', () => {
            usePollingFetch.mockReturnValue({
                data: null,
                loading: false,
                error: 'Failed to fetch sales data'
            });

            render(<Sales />);
            expect(screen.getByText('Failed to fetch sales data')).toBeInTheDocument();
        });

        it('should not render charts when there is an error', () => {
            usePollingFetch.mockReturnValue({
                data: null,
                loading: false,
                error: 'Failed to fetch sales data'
            });

            render(<Sales />);
            expect(screen.queryByTestId('units-sold-chart')).not.toBeInTheDocument();
            expect(screen.queryByTestId('revenue-chart')).not.toBeInTheDocument();
        });

        it('should not show error banner because component exits early on error', () => {
            usePollingFetch.mockReturnValue({
                data: {},
                loading: false,
                error: 'Partial data received'
            });

            render(<Sales />);
            const errorText = screen.getByText('Partial data received');
            expect(errorText.tagName).toBe('P');
        });

        it('should not render charts when any error is present', () => {
            usePollingFetch.mockReturnValue({
                data: {},
                loading: false,
                error: 'Minor warning'
            });

            render(<Sales />);
            expect(screen.queryByTestId('units-sold-chart')).not.toBeInTheDocument();
            expect(screen.queryByTestId('revenue-chart')).not.toBeInTheDocument();
        });
    });


	describe('Successful Data Loading', () => {
		it('should render all charts when data loads successfully', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			render(<Sales />);

			expect(screen.getByTestId('units-sold-chart')).toBeInTheDocument();
			expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
		});

		it('should pass data correctly to UnitsSoldChart', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			render(<Sales />);
			expect(screen.getByTestId('units-sold-chart').textContent).toContain(JSON.stringify(mockData));
		});

		it('should pass data correctly to RevenueChart', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			render(<Sales />);
			expect(screen.getByTestId('revenue-chart').textContent).toContain(JSON.stringify(mockData));
		});

		it('should not show error banner when there is no error', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			render(<Sales />);
			expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
		});
	});

	describe('Structure & Styling', () => {
		it('should render main container with correct classes', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			const { container } = render(<Sales />);
			const main = container.querySelector('main');

			expect(main).toBeInTheDocument();
			expect(main.className).toMatch(/grid-container/);
			expect(main.className).toMatch(/gridContainer/);
		});

		it('should render sections with correct class names', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			const { container } = render(<Sales />);
			const sections = container.querySelectorAll('section');

			expect(sections).toHaveLength(2);
			expect(sections[0].className).toMatch(/unitsSold/);
			expect(sections[1].className).toMatch(/revenue/);
		});
	});

	describe('Hook Integration', () => {
		it('should call usePollingFetch with correct parameters', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			render(<Sales />);
			expect(usePollingFetch).toHaveBeenCalledWith(getSalesData, 15000);
		});

		it('should handle undefined data gracefully', () => {
			usePollingFetch.mockReturnValue({
				data: undefined,
				loading: false,
				error: null
			});

			render(<Sales />);
			expect(screen.getByTestId('units-sold-chart')).toBeInTheDocument();
			expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
		});

		it('should handle null data gracefully', () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: false,
				error: null
			});

			render(<Sales />);
			expect(screen.getByTestId('units-sold-chart')).toBeInTheDocument();
			expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
		});
	});

	describe('State Transitions', () => {
		it('should transition from loading to loaded', async () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: true,
				error: null
			});

			const { rerender } = render(<Sales />);
			expect(screen.getByText('Loading...')).toBeInTheDocument();

			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			rerender(<Sales />);
			await waitFor(() => {
				expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
				expect(screen.getByTestId('units-sold-chart')).toBeInTheDocument();
			});
		});

		it('should transition from loading to error state', async () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: true,
				error: null
			});

			const { rerender } = render(<Sales />);
			expect(screen.getByText('Loading...')).toBeInTheDocument();

			usePollingFetch.mockReturnValue({
				data: null,
				loading: false,
				error: 'Failed to fetch sales data'
			});

			rerender(<Sales />);
			await waitFor(() => {
				expect(screen.getByText('Failed to fetch sales data')).toBeInTheDocument();
			});
		});

		it('should recover from error to loaded state', async () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: false,
				error: 'Failed to fetch sales data'
			});

			const { rerender } = render(<Sales />);
			expect(screen.getByText('Failed to fetch sales data')).toBeInTheDocument();

			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: null
			});

			rerender(<Sales />);
			await waitFor(() => {
				expect(screen.queryByText('Failed to fetch sales data')).not.toBeInTheDocument();
				expect(screen.getByTestId('units-sold-chart')).toBeInTheDocument();
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

			render(<Sales />);
			expect(screen.getByTestId('units-sold-chart')).toBeInTheDocument();
			expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
		});

		it('should handle empty string error', () => {
			usePollingFetch.mockReturnValue({
				data: mockData,
				loading: false,
				error: ''
			});

			const { container } = render(<Sales />);
			const banner = container.querySelector('[class*="errorBanner"]');
			expect(banner).not.toBeInTheDocument();
		});

		it('should prioritise loading state when both loading and error are true', () => {
			usePollingFetch.mockReturnValue({
				data: null,
				loading: true,
				error: 'Some error'
			});

			render(<Sales />);
			expect(screen.getByText('Loading...')).toBeInTheDocument();
			expect(screen.queryByText('Some error')).not.toBeInTheDocument();
		});
	});
});
