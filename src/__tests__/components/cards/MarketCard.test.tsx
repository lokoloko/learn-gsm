import { render, screen } from '@testing-library/react';
import { MarketCard } from '@/components/cards/MarketCard';
import type { JurisdictionForDirectory } from '@/types/database';

const mockMarket: JurisdictionForDirectory = {
  id: 'jurisdiction-123',
  slug: 'miami-beach-fl',
  name: 'Miami Beach',
  full_name: 'City of Miami Beach',
  state_code: 'FL',
  state_name: 'Florida',
  jurisdiction_type: 'city',
  population: 92000,
  regulation: {
    summary: 'Miami Beach has strict STR regulations requiring permits and limiting rentals.',
    confidence_score: 0.95,
    status: 'published',
    registration: {
      city: { required: true, fee: 520 },
    },
    eligibility: {
      primary_residence_required: true,
    } as any,
    limits: {
      city: { nights_per_year: 180 },
    },
    taxes: {
      total_tax_rate_city: 13.0,
      state_sales_tax: null,
      total_tax_rate_county: null,
    },
    penalties: {
      city: { max_fine: 20000 },
    },
    updated_at: '2024-01-15T10:00:00Z',
  },
};

describe('MarketCard component', () => {
  describe('basic rendering', () => {
    it('renders market name', () => {
      render(<MarketCard market={mockMarket} />);
      expect(screen.getByText('Miami Beach')).toBeInTheDocument();
    });

    it('renders state name', () => {
      render(<MarketCard market={mockMarket} />);
      expect(screen.getByText('Florida')).toBeInTheDocument();
    });

    it('renders regulation summary', () => {
      render(<MarketCard market={mockMarket} />);
      expect(
        screen.getByText(/Miami Beach has strict STR regulations/)
      ).toBeInTheDocument();
    });
  });

  describe('strictness badge', () => {
    it('renders strict badge for strict market', () => {
      render(<MarketCard market={mockMarket} />);
      expect(screen.getByText('Strict')).toBeInTheDocument();
    });

    it('renders permissive badge for market without regulation', () => {
      const marketNoReg = { ...mockMarket, regulation: null };
      render(<MarketCard market={marketNoReg} />);
      expect(screen.getByText('Permissive')).toBeInTheDocument();
    });
  });

  describe('boolean flags', () => {
    it('renders permit flag as active', () => {
      render(<MarketCard market={mockMarket} />);
      expect(screen.getByText('Permit')).toBeInTheDocument();
      // Check it's not struck through (active)
      const permitElement = screen.getByText('Permit');
      expect(permitElement).not.toHaveClass('line-through');
    });

    it('renders night limits flag as active', () => {
      render(<MarketCard market={mockMarket} />);
      expect(screen.getByText('Night limits')).toBeInTheDocument();
    });

    it('renders primary residence flag as active', () => {
      render(<MarketCard market={mockMarket} />);
      expect(screen.getByText('Primary residence')).toBeInTheDocument();
    });

    it('renders inactive flags with line-through class', () => {
      const marketNoFlags: JurisdictionForDirectory = {
        ...mockMarket,
        regulation: {
          summary: 'Test',
          confidence_score: 0.9,
          status: 'published',
          registration: null,
          eligibility: null,
          limits: null,
          taxes: null,
          penalties: null,
          updated_at: '2024-01-15T10:00:00Z',
        },
      };
      render(<MarketCard market={marketNoFlags} />);
      const permitElement = screen.getByText('Permit');
      expect(permitElement.closest('span')).toHaveClass('line-through');
    });
  });

  describe('tax rate', () => {
    it('renders total tax rate when present', () => {
      render(<MarketCard market={mockMarket} />);
      expect(screen.getByText(/13.0% total tax/)).toBeInTheDocument();
    });

    it('shows unavailable message when no tax rate', () => {
      const marketNoTax: JurisdictionForDirectory = {
        ...mockMarket,
        regulation: {
          ...mockMarket.regulation!,
          taxes: null,
        },
      };
      render(<MarketCard market={marketNoTax} />);
      expect(screen.getByText('Tax info unavailable')).toBeInTheDocument();
    });
  });

  describe('links', () => {
    it('links to correct regulation URL using slug', () => {
      render(<MarketCard market={mockMarket} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/regulations/miami-beach-fl');
    });
  });

  describe('hover state', () => {
    it('has View details text hidden by default', () => {
      render(<MarketCard market={mockMarket} />);
      const viewDetails = screen.getByText('View details');
      expect(viewDetails).toHaveClass('opacity-0');
    });
  });

  describe('edge cases', () => {
    it('handles market without regulation gracefully', () => {
      const marketNoReg = { ...mockMarket, regulation: null };
      render(<MarketCard market={marketNoReg} />);
      expect(screen.getByText('Miami Beach')).toBeInTheDocument();
      expect(screen.getByText('Permissive')).toBeInTheDocument();
    });

    it('handles market with minimal regulation data', () => {
      const minimalMarket: JurisdictionForDirectory = {
        id: 'min-market',
        slug: 'minimal-city',
        name: 'Minimal City',
        full_name: null,
        state_code: 'TX',
        state_name: 'Texas',
        jurisdiction_type: 'city',
        population: null,
        regulation: {
          summary: null,
          confidence_score: 0.5,
          status: 'draft',
          registration: null,
          eligibility: null,
          limits: null,
          taxes: null,
          penalties: null,
          updated_at: '2024-01-01T00:00:00Z',
        },
      };
      render(<MarketCard market={minimalMarket} />);
      expect(screen.getByText('Minimal City')).toBeInTheDocument();
      expect(screen.getByText('Texas')).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(
        <MarketCard market={mockMarket} className="custom-class" />
      );
      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });
  });
});
