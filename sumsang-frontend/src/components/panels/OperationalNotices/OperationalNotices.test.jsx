import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import OperationalNotices from './OperationalNotices';
import { getNoticesData } from '../../../api/dataFetcher';
import { usePollingFetch } from '../../../hooks/usePollingFetch';

// Mock dependencies
vi.mock('../../../api/dataFetcher');
vi.mock('../../../hooks/usePollingFetch');

describe('OperationalNotices', () => {
	const mockData = {
		notices: [
			{ id: 1, title: 'Notice 1', description: 'Desc 1' },
			{ id: 2, title: 'Notice 2', description: 'Desc 2' },
		]
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
			render(<OperationalNotices />);
			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('should not render sections while loading', () => {
			usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
			const { container } = render(<OperationalNotices />);
			const sections = container.querySelectorAll('section');
			expect(sections).toHaveLength(0);
		});
	});

	describe('Error Handling', () => {
		it('should display error message when there is an error', () => {
			usePollingFetch.mockReturnValue({ data: null, loading: false, error: 'Failed to fetch notices' });
			render(<OperationalNotices />);
			expect(screen.getByText('Failed to fetch notices')).toBeInTheDocument();
		});

		it('should not render sections when there is an error', () => {
			usePollingFetch.mockReturnValue({ data: null, loading: false, error: 'Failed to fetch notices' });
			const { container } = render(<OperationalNotices />);
			const sections = container.querySelectorAll('section');
			expect(sections).toHaveLength(0);
		});
	});

	describe('Successful Data Loading', () => {
		it('should render all sections when data loads successfully', () => {
			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			const { container } = render(<OperationalNotices />);
			const sections = container.querySelectorAll('section');
			expect(sections).toHaveLength(3);
		});
	});

	describe('Structure & Styling', () => {
		it('should render main container with correct classes', () => {
			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			const { container } = render(<OperationalNotices />);
			const main = container.querySelector('main');
			expect(main).toBeInTheDocument();
			expect(main.className).toMatch(/grid-container/);
			expect(main.className).toMatch(/gridContainer/);
		});

		it('should render sections with correct class names', () => {
			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			const { container } = render(<OperationalNotices />);
			const sections = container.querySelectorAll('section');
			expect(sections[0].className).toMatch(/partCosts/);
			expect(sections[1].className).toMatch(/partsInventory/);
			expect(sections[2].className).toMatch(/goodsInventory/);
		});
	});

	describe('Hook Integration', () => {
		it('should call usePollingFetch with correct parameters', () => {
			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			render(<OperationalNotices />);
			expect(usePollingFetch).toHaveBeenCalledWith(getNoticesData, 15000);
		});
	});

	describe('State Transitions', () => {
		it('should transition from loading to loaded', async () => {
			usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
			const { rerender, container } = render(<OperationalNotices />);
			expect(screen.getByText('Loading...')).toBeInTheDocument();

			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: null });
			rerender(<OperationalNotices />);

			await waitFor(() => {
				expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
				const sections = container.querySelectorAll('section');
				expect(sections).toHaveLength(3);
			});
		});

		it('should transition from loading to error', async () => {
			usePollingFetch.mockReturnValue({ data: null, loading: true, error: null });
			const { rerender } = render(<OperationalNotices />);
			expect(screen.getByText('Loading...')).toBeInTheDocument();

			usePollingFetch.mockReturnValue({ data: null, loading: false, error: 'Failed to fetch notices' });
			rerender(<OperationalNotices />);

			await waitFor(() => {
				expect(screen.getByText('Failed to fetch notices')).toBeInTheDocument();
			});
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty data object', () => {
			usePollingFetch.mockReturnValue({ data: {}, loading: false, error: null });
			const { container } = render(<OperationalNotices />);
			const sections = container.querySelectorAll('section');
			expect(sections).toHaveLength(3);
		});

		it('should handle empty string error', () => {
			usePollingFetch.mockReturnValue({ data: mockData, loading: false, error: '' });
			const { container } = render(<OperationalNotices />);
			const banner = container.querySelector('[class*="errorBanner"]');
			expect(banner).not.toBeInTheDocument();
		});
	});
});
