import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavigationBar from './NavigationBar';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

// Helper function to render component with router
const renderWithRouter = (initialRoute = '/production') => {
	return render(
		<MemoryRouter initialEntries={[initialRoute]}>
			<NavigationBar />
		</MemoryRouter>
	);
};

describe('NavigationBar', () => {
	beforeEach(() => {
		mockNavigate.mockClear();
	});

	describe('Rendering', () => {
		it('should render the navigation bar', () => {
			renderWithRouter();
			const nav = screen.getByRole('navigation');
			expect(nav).toBeInTheDocument();
		});

		it('should render all navigation links', () => {
			renderWithRouter();
			expect(screen.getByTitle('Production Overview')).toBeInTheDocument();
			expect(screen.getByTitle('Supply Chain')).toBeInTheDocument();
			expect(screen.getByTitle('Logistics Flow')).toBeInTheDocument();
			expect(screen.getByTitle('Sales')).toBeInTheDocument();
			expect(screen.getByTitle('Financial Performance')).toBeInTheDocument();
		});

		it('should render toggle button with correct aria-label', () => {
			renderWithRouter();
			const toggleButton = screen.getByRole('button', { name: /expand navigation/i });
			expect(toggleButton).toBeInTheDocument();
		});

		it('should start in collapsed state', () => {
			renderWithRouter();
			const nav = screen.getByRole('navigation');
			expect(nav).not.toHaveClass('expanded');
		});
	});

	describe('Navigation Toggle', () => {
		it('should expand navigation when toggle button is clicked', () => {
			renderWithRouter();
			const toggleButton = screen.getByRole('button', { name: /expand navigation/i });
			
			fireEvent.click(toggleButton);
			
			const nav = screen.getByRole('navigation');
			expect(nav.className).toMatch(/expanded/);
		});

		it('should collapse navigation when toggle button is clicked again', () => {
			renderWithRouter();
			const toggleButton = screen.getByRole('button', { name: /expand navigation/i });
			
			fireEvent.click(toggleButton);
			const collapseButton = screen.getByRole('button', { name: /collapse navigation/i });
			fireEvent.click(collapseButton);
			
			const nav = screen.getByRole('navigation');
			expect(nav.className).not.toMatch(/expanded/);
		});

		it('should toggle with Enter key', () => {
			renderWithRouter();
			const toggleButton = screen.getByRole('button', { name: /expand navigation/i });
			
			fireEvent.keyDown(toggleButton, { key: 'Enter' });
			
			const nav = screen.getByRole('navigation');
			expect(nav.className).toMatch(/expanded/);
		});

		it('should toggle with Space key', () => {
			renderWithRouter();
			const toggleButton = screen.getByRole('button', { name: /expand navigation/i });
			
			fireEvent.keyDown(toggleButton, { key: ' ' });
			
			const nav = screen.getByRole('navigation');
			expect(nav.className).toMatch(/expanded/);
		});

		it('should update aria-pressed attribute when toggled', () => {
			renderWithRouter();
			const toggleButton = screen.getByRole('button', { name: /expand navigation/i });
			
			expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
			
			fireEvent.click(toggleButton);
			
			expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
		});
	});

	describe('Navigation Interactions', () => {
		it('should navigate when a link is clicked', () => {
			renderWithRouter();
			const supplyChainLink = screen.getByTitle('Supply Chain');
			
			fireEvent.click(supplyChainLink);
			
			expect(mockNavigate).toHaveBeenCalledWith('/supply');
		});

		it('should navigate when Enter key is pressed on a link', () => {
			renderWithRouter();
			const salesLink = screen.getByTitle('Sales');
			
			fireEvent.keyDown(salesLink, { key: 'Enter' });
			
			expect(mockNavigate).toHaveBeenCalledWith('/sales');
		});

		it('should navigate when Space key is pressed on a link', () => {
			renderWithRouter();
			const logisticsLink = screen.getByTitle('Logistics Flow');
			
			fireEvent.keyDown(logisticsLink, { key: ' ' });
			
			expect(mockNavigate).toHaveBeenCalledWith('/logistics');
		});

		it('should not navigate on other key presses', () => {
			renderWithRouter();
			const salesLink = screen.getByTitle('Sales');
			
			fireEvent.keyDown(salesLink, { key: 'Tab' });
			
			expect(mockNavigate).not.toHaveBeenCalled();
		});
	});

	describe('Active State', () => {
		it('should mark the current route as active', () => {
			renderWithRouter('/production');
			const productionLink = screen.getByTitle('Production Overview');
			
			expect(productionLink.className).toMatch(/active/);
			expect(productionLink).toHaveAttribute('aria-current', 'page');
		});

		it('should update active state when route changes', () => {
			renderWithRouter('/production');
			
			// Click to navigate to sales
			const salesLink = screen.getByTitle('Sales');
			fireEvent.click(salesLink);
			
			// Verify navigate was called
			expect(mockNavigate).toHaveBeenCalledWith('/sales');
		});

		it('should position active indicator based on active index', () => {
			renderWithRouter('/logistics');
			// Query the element directly since it has aria-hidden="true"
			const presentationItem = document.querySelector('[role="presentation"]');
			const activeIndicator = presentationItem?.querySelector('div');
			
			// Logistics is at index 2, so translateY should be 16vmin (2 * 8vmin)
			expect(activeIndicator).toHaveStyle({ transform: 'translateY(16vmin)' });
		});

		it('should not mark any link as active for unknown routes', () => {
			renderWithRouter('/unknown');
			
			const links = screen.getAllByRole('listitem').filter(li => li.title);
			links.forEach(link => {
				expect(link.className).not.toMatch(/active/);
				expect(link).not.toHaveAttribute('aria-current', 'page');
			});
		});
	});

	describe('Accessibility', () => {
		it('should have proper tabIndex on all interactive elements', () => {
			renderWithRouter();
			
			const toggleButton = screen.getByRole('button');
			expect(toggleButton).toHaveAttribute('tabIndex', '0');
			
			const productionLink = screen.getByTitle('Production Overview');
			expect(productionLink).toHaveAttribute('tabIndex', '0');
		});

		it('should show titles only when collapsed', () => {
			renderWithRouter();
			
			// Initially collapsed, should have titles
			let productionLink = screen.getByTitle('Production Overview');
			expect(productionLink).toHaveAttribute('title', 'Production Overview');
			
			// Expand
			const toggleButton = screen.getByRole('button');
			fireEvent.click(toggleButton);
			
			// When expanded, titles should be empty string
			productionLink = screen.getByText('Production Overview').closest('li');
			expect(productionLink).toHaveAttribute('title', '');
		});

		it('should have proper ARIA labels', () => {
			renderWithRouter();
			
			const toggleButton = screen.getByRole('button', { name: /expand navigation/i });
			expect(toggleButton).toHaveAttribute('aria-label', 'Expand navigation');
		});
	});

	describe('Icon Rendering', () => {
		it('should render all navigation icons', () => {
			renderWithRouter();
			
			// MUI icons have aria-hidden="true", so query by testid instead
			expect(screen.getByTestId('MenuIcon')).toBeInTheDocument();
			expect(screen.getByTestId('FactoryIcon')).toBeInTheDocument();
			expect(screen.getByTestId('InventoryIcon')).toBeInTheDocument();
			expect(screen.getByTestId('LocalShippingIcon')).toBeInTheDocument();
			expect(screen.getByTestId('PointOfSaleIcon')).toBeInTheDocument();
			expect(screen.getByTestId('AccountBalanceIcon')).toBeInTheDocument();
		});

		it('should toggle between MenuIcon and MenuOpenIcon', () => {
			renderWithRouter();
			
			// Initially MenuIcon should be present
			expect(screen.getByTestId('MenuIcon')).toBeInTheDocument();
			expect(screen.queryByTestId('MenuOpenIcon')).not.toBeInTheDocument();
			
			// Toggle
			const toggleButton = screen.getByRole('button');
			fireEvent.click(toggleButton);
			
			// Now MenuOpenIcon should be present
			expect(screen.getByTestId('MenuOpenIcon')).toBeInTheDocument();
			expect(screen.queryByTestId('MenuIcon')).not.toBeInTheDocument();
		});
	});
});