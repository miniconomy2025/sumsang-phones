import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SupplyChain from './SupplyChain';
import { getSupplyChainData } from '../../../api/dataFetcher';
import { usePollingFetch } from '../../../hooks/usePollingFetch';

// Mock dependencies
vi.mock('../../../api/dataFetcher');
vi.mock('../../../hooks/usePollingFetch');
vi.mock('./charts/PartCostsChart', () => ({
	default: ({ data }) => <div data-testid="part-costs-chart">Part Costs Chart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/PartsInventoryChart', () => ({
	default: ({ data }) => <div data-testid="parts-inventory-chart">Parts Inventory Chart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/GoodsInventoryChart', () => ({
	default: ({ data }) => <div data-testid="goods-inventory-chart">Goods Inventory Chart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/MachineStatusChart', () => ({
	default: ({ data }) => <div data-testid="machine-status-chart">Machine Status Chart: {JSON.stringify(data)}</div>
}));
vi.mock('./charts/ProductionCapacityChart', () => ({
	default: ({ data }) => <div data-testid="production-capacity-chart">Production Capacity Chart: {JSON.stringify(data)}</div>
}));

describe('SupplyChain', () => {
	const mockData = {
		partCosts: 25000,
		partsInventory: 400,
		goodsInventory: 120,
		machineStatus: 'operational',
		productionCapacity: 95
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Loading State', () => {
		it('should display loading message when fetching data', () => {
			usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
			render(<SupplyChain />);
			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('should not render charts while loading', () => {
			usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
			render(<SupplyChain />);
			expect(screen.queryByTestId('part-costs-chart')).not.toBeInTheDocument();
		});
	});

	describe('Error Handling', () => {
		it('should display error message when there is an error', () => {
			usePollingFetch.mockReturnValue({ data: null, loading: false, error: 'Failed to fetch supply chain data' });
			render(<SupplyChain />);
			expect(screen.getByText('Failed to fetch supply chain data')).toBeInTheDocument();
		});

		it('should not render charts when there is an error', () => {
			usePollingFetch.mockReturnValue({ data: null, loading: false, error: 'Failed to fetch supply chain data' });
			render(<SupplyChain />);
			expect(screen.queryByTestId('part-costs-chart')).not.toBeInTheDocument();
		});

		it('should not show error banner because component exits early on error', () => {
			usePollingFetch.mockReturnValue({ data: {}, loading: false, error: 'Partial data received' });
			render(<SupplyChain />);
			const errorText = screen.getByText('Partial data received');
			expect(errorText.tagName).toBe('P');
		});

		it('should not render charts when any error is present', () => {
			usePollingFetch.mockReturnValue({ data: {}, loading: false, error: 'Minor warning' });
			render(<SupplyChain />);
			expect(screen.queryByTestId('part-costs-chart')).not.toBeInTheDocument();
		});
	});

	describe('Successful Data Loading', () => {
		it('should render all charts when data loads successfully', () => {
			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			render(<SupplyChain />);
			expect(screen.getByTestId('part-costs-chart')).toBeInTheDocument();
			expect(screen.getByTestId('parts-inventory-chart')).toBeInTheDocument();
			expect(screen.getByTestId('goods-inventory-chart')).toBeInTheDocument();
			expect(screen.getByTestId('machine-status-chart')).toBeInTheDocument();
			expect(screen.getByTestId('production-capacity-chart')).toBeInTheDocument();
		});

		it('should pass data correctly to each chart', () => {
			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			render(<SupplyChain />);
			expect(screen.getByTestId('part-costs-chart').textContent).toContain(JSON.stringify(mockData));
			expect(screen.getByTestId('machine-status-chart').textContent).toContain(JSON.stringify(mockData));
		});

		it('should not show error banner when there is no error', () => {
			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			render(<SupplyChain />);
			expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
		});
	});

	describe('Structure & Styling', () => {
		it('should render main container with correct classes', () => {
			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			const { container } = render(<SupplyChain />);
			const main = container.querySelector('main');
			expect(main).toBeInTheDocument();
			expect(main.className).toMatch(/grid-container/);
			expect(main.className).toMatch(/gridContainer/);
		});

		it('should render five sections with correct class names', () => {
			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			const { container } = render(<SupplyChain />);
			const sections = container.querySelectorAll('section');
			expect(sections).toHaveLength(5);
			expect(sections[0].className).toMatch(/partCosts/);
			expect(sections[1].className).toMatch(/partsInventory/);
			expect(sections[2].className).toMatch(/goodsInventory/);
			expect(sections[3].className).toMatch(/machineStatus/);
			expect(sections[4].className).toMatch(/productionCapacity/);
		});
	});

	describe('Hook Integration', () => {
		it('should call usePollingFetch with correct parameters', () => {
			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			render(<SupplyChain />);
			expect(usePollingFetch).toHaveBeenCalledWith(getSupplyChainData, 15000);
		});

		it('should handle undefined data gracefully', () => {
			usePollingFetch.mockReturnValue({ data: undefined, loading: false, error: null });
			render(<SupplyChain />);
			expect(screen.getByTestId('part-costs-chart')).toBeInTheDocument();
		});

		it('should handle null data gracefully', () => {
			usePollingFetch.mockReturnValue({ data: null, loading: false, error: null });
			render(<SupplyChain />);
			expect(screen.getByTestId('part-costs-chart')).toBeInTheDocument();
		});
	});

	describe('State Transitions', () => {
		it('should transition from loading to loaded', async () => {
			usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
			const { rerender } = render(<SupplyChain />);
			expect(screen.getByText('Loading...')).toBeInTheDocument();

			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			rerender(<SupplyChain />);
			await waitFor(() => {
				expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
				expect(screen.getByTestId('part-costs-chart')).toBeInTheDocument();
			});
		});

		it('should transition from loading to error state', async () => {
			usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
			const { rerender } = render(<SupplyChain />);
			expect(screen.getByText('Loading...')).toBeInTheDocument();

			usePollingFetch.mockReturnValue({ data: null, loading: false, error: 'Failed to fetch supply chain data' });
			rerender(<SupplyChain />);
			await waitFor(() => {
				expect(screen.getByText('Failed to fetch supply chain data')).toBeInTheDocument();
			});
		});

		it('should recover from error to loaded state', async () => {
			usePollingFetch.mockReturnValue({ data: null, loading: false, error: 'Failed to fetch supply chain data' });
			const { rerender } = render(<SupplyChain />);
			expect(screen.getByText('Failed to fetch supply chain data')).toBeInTheDocument();

			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			rerender(<SupplyChain />);
			await waitFor(() => {
				expect(screen.queryByText('Failed to fetch supply chain data')).not.toBeInTheDocument();
				expect(screen.getByTestId('part-costs-chart')).toBeInTheDocument();
			});
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty data object', () => {
			usePollingFetch.mockReturnValue({ data: {}, loading: false, error: null });
			render(<SupplyChain />);
			expect(screen.getByTestId('part-costs-chart')).toBeInTheDocument();
		});

		it('should handle empty string error', () => {
			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: '' });
			const { container } = render(<SupplyChain />);
			const banner = container.querySelector('[class*="errorBanner"]');
			expect(banner).not.toBeInTheDocument();
		});

		it('should prioritise loading state when both loading and error are true', () => {
			usePollingFetch.mockReturnValue({ data: null, loading: true, error: 'Some error' });
			render(<SupplyChain />);
			expect(screen.getByText('Loading...')).toBeInTheDocument();
			expect(screen.queryByText('Some error')).not.toBeInTheDocument();
		});
	});
});
