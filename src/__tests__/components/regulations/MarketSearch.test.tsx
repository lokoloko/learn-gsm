import { render, screen, fireEvent } from '@testing-library/react';
import { MarketSearch } from '@/components/regulations/MarketSearch';
import type { JurisdictionForDirectory } from '@/types/database';

const mockMarkets: JurisdictionForDirectory[] = [
  {
    id: '1',
    slug: 'miami-beach-fl',
    name: 'Miami Beach',
    full_name: 'City of Miami Beach',
    state_code: 'FL',
    state_name: 'Florida',
    jurisdiction_type: 'city',
    population: 92000,
    regulation: {
      summary: 'Strict regulations',
      confidence_score: 0.95,
      status: 'published',
      registration: { city: { required: true } },
      eligibility: null,
      limits: null,
      taxes: null,
      penalties: null,
      updated_at: '2024-01-01',
    },
  },
  {
    id: '2',
    slug: 'austin-tx',
    name: 'Austin',
    full_name: 'City of Austin',
    state_code: 'TX',
    state_name: 'Texas',
    jurisdiction_type: 'city',
    population: 1000000,
    regulation: null,
  },
  {
    id: '3',
    slug: 'san-francisco-ca',
    name: 'San Francisco',
    full_name: null,
    state_code: 'CA',
    state_name: 'California',
    jurisdiction_type: 'city',
    population: 870000,
    regulation: null,
  },
];

describe('MarketSearch component', () => {
  describe('rendering', () => {
    it('renders search input', () => {
      render(<MarketSearch markets={mockMarkets} />);
      expect(screen.getByPlaceholderText(/search by city or state/i)).toBeInTheDocument();
    });

    it('renders search icon', () => {
      const { container } = render(<MarketSearch markets={mockMarkets} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('shows results when typing', () => {
      render(<MarketSearch markets={mockMarkets} />);
      const input = screen.getByPlaceholderText(/search by city or state/i);

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Miami' } });

      expect(screen.getByText('Miami Beach')).toBeInTheDocument();
    });

    it('filters by state name', () => {
      render(<MarketSearch markets={mockMarkets} />);
      const input = screen.getByPlaceholderText(/search by city or state/i);

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Texas' } });

      expect(screen.getByText('Austin')).toBeInTheDocument();
      expect(screen.queryByText('Miami Beach')).not.toBeInTheDocument();
    });

    it('filters by state code', () => {
      render(<MarketSearch markets={mockMarkets} />);
      const input = screen.getByPlaceholderText(/search by city or state/i);

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'CA' } });

      expect(screen.getByText('San Francisco')).toBeInTheDocument();
    });

    it('shows no results message for unmatched query', () => {
      render(<MarketSearch markets={mockMarkets} />);
      const input = screen.getByPlaceholderText(/search by city or state/i);

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'zzz' } });

      expect(screen.getByText(/no markets found/i)).toBeInTheDocument();
    });
  });

  describe('clear button', () => {
    it('shows clear button when query exists', () => {
      render(<MarketSearch markets={mockMarkets} />);
      const input = screen.getByPlaceholderText(/search by city or state/i);

      fireEvent.change(input, { target: { value: 'Miami' } });

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });

    it('clears input when clear button is clicked', () => {
      render(<MarketSearch markets={mockMarkets} />);
      const input = screen.getByPlaceholderText(/search by city or state/i) as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'Miami' } });
      expect(input.value).toBe('Miami');

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearButton);

      expect(input.value).toBe('');
    });
  });

  describe('result links', () => {
    it('links to correct regulation URL', () => {
      render(<MarketSearch markets={mockMarkets} />);
      const input = screen.getByPlaceholderText(/search by city or state/i);

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Miami' } });

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/regulations/miami-beach-fl');
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(
        <MarketSearch markets={mockMarkets} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
