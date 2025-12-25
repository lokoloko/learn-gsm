import { render, screen, fireEvent } from '@testing-library/react';
import { StateGrouper } from '@/components/regulations/StateGrouper';
import type { JurisdictionForDirectory } from '@/types/database';

const mockMarkets: JurisdictionForDirectory[] = [
  {
    id: '1',
    slug: 'miami-beach-fl',
    name: 'Miami Beach',
    full_name: null,
    state_code: 'FL',
    state_name: 'Florida',
    jurisdiction_type: 'city',
    population: 92000,
    regulation: null,
  },
  {
    id: '2',
    slug: 'orlando-fl',
    name: 'Orlando',
    full_name: null,
    state_code: 'FL',
    state_name: 'Florida',
    jurisdiction_type: 'city',
    population: 300000,
    regulation: null,
  },
  {
    id: '3',
    slug: 'austin-tx',
    name: 'Austin',
    full_name: null,
    state_code: 'TX',
    state_name: 'Texas',
    jurisdiction_type: 'city',
    population: 1000000,
    regulation: null,
  },
];

describe('StateGrouper component', () => {
  describe('rendering', () => {
    it('renders state groups', () => {
      render(<StateGrouper markets={mockMarkets} />);
      expect(screen.getByText('Florida')).toBeInTheDocument();
      expect(screen.getByText('Texas')).toBeInTheDocument();
    });

    it('renders market count for each state', () => {
      render(<StateGrouper markets={mockMarkets} />);
      expect(screen.getByText('2 markets')).toBeInTheDocument();
      expect(screen.getByText('1 market')).toBeInTheDocument();
    });

    it('renders expand/collapse controls', () => {
      render(<StateGrouper markets={mockMarkets} />);
      expect(screen.getByText('Expand All')).toBeInTheDocument();
      expect(screen.getByText('Collapse All')).toBeInTheDocument();
    });
  });

  describe('expand/collapse functionality', () => {
    it('shows markets when state is expanded', () => {
      render(<StateGrouper markets={mockMarkets} />);

      // Initially collapsed - markets not visible
      expect(screen.queryByText('Miami Beach')).not.toBeInTheDocument();

      // Click Florida to expand
      fireEvent.click(screen.getByText('Florida'));

      // Now markets should be visible
      expect(screen.getByText('Miami Beach')).toBeInTheDocument();
      expect(screen.getByText('Orlando')).toBeInTheDocument();
    });

    it('hides markets when state is collapsed', () => {
      render(<StateGrouper markets={mockMarkets} />);

      // Expand Florida
      fireEvent.click(screen.getByText('Florida'));
      expect(screen.getByText('Miami Beach')).toBeInTheDocument();

      // Collapse Florida
      fireEvent.click(screen.getByText('Florida'));
      expect(screen.queryByText('Miami Beach')).not.toBeInTheDocument();
    });

    it('expands all states when Expand All clicked', () => {
      render(<StateGrouper markets={mockMarkets} />);

      fireEvent.click(screen.getByText('Expand All'));

      expect(screen.getByText('Miami Beach')).toBeInTheDocument();
      expect(screen.getByText('Austin')).toBeInTheDocument();
    });

    it('collapses all states when Collapse All clicked', () => {
      render(<StateGrouper markets={mockMarkets} />);

      // First expand all
      fireEvent.click(screen.getByText('Expand All'));
      expect(screen.getByText('Miami Beach')).toBeInTheDocument();

      // Then collapse all
      fireEvent.click(screen.getByText('Collapse All'));
      expect(screen.queryByText('Miami Beach')).not.toBeInTheDocument();
    });
  });

  describe('market links', () => {
    it('links to correct regulation URL', () => {
      render(<StateGrouper markets={mockMarkets} />);

      // Expand Florida
      fireEvent.click(screen.getByText('Florida'));

      const link = screen.getByRole('link', { name: /miami beach/i });
      expect(link).toHaveAttribute('href', '/regulations/miami-beach-fl');
    });
  });

  describe('empty state', () => {
    it('shows empty message when no markets', () => {
      render(<StateGrouper markets={[]} />);
      expect(screen.getByText(/no markets available/i)).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(
        <StateGrouper markets={mockMarkets} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
