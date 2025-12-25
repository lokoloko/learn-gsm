import { render, screen } from '@testing-library/react';
import { AtAGlance } from '@/components/regulations/AtAGlance';
import type { Regulation } from '@/types/database';

const mockRegulation: Regulation = {
  id: 'reg-123',
  jurisdiction_id: 'jur-123',
  primary_source_id: null,
  summary: 'Test regulation summary',
  plain_english: null,
  registration: {
    city: {
      required: true,
      fee: 520,
      processing_time: '2-4 weeks',
    },
  },
  eligibility: {
    primary_residence_required: true,
  } as any,
  limits: {
    city: {
      nights_per_year: 90,
    },
  },
  taxes: {
    total_tax_rate_city: 13.5,
    state_sales_tax: null,
    total_tax_rate_county: null,
  },
  insurance: null,
  safety: null,
  penalties: {
    city: {
      max_fine: 15000,
    },
  },
  exemptions: null,
  preemption: null,
  effective_date: null,
  last_amended: null,
  next_review_date: null,
  law_reference: null,
  confidence_score: 0.95,
  needs_review: false,
  verified_at: null,
  verified_by: null,
  verification_notes: null,
  status: 'published',
  created_at: '2024-01-01',
  updated_at: '2024-01-15',
};

describe('AtAGlance component', () => {
  describe('rendering', () => {
    it('renders the title', () => {
      render(<AtAGlance regulation={mockRegulation} />);
      expect(screen.getByText('At a Glance')).toBeInTheDocument();
    });

    it('renders permit required status', () => {
      render(<AtAGlance regulation={mockRegulation} />);
      expect(screen.getByText('Permit Required')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('renders night limit', () => {
      render(<AtAGlance regulation={mockRegulation} />);
      expect(screen.getByText('Night Limit')).toBeInTheDocument();
      expect(screen.getByText('90/year')).toBeInTheDocument();
    });

    it('renders primary residence status', () => {
      render(<AtAGlance regulation={mockRegulation} />);
      expect(screen.getByText('Primary Residence')).toBeInTheDocument();
      expect(screen.getByText('Required')).toBeInTheDocument();
    });

    it('renders total tax rate', () => {
      render(<AtAGlance regulation={mockRegulation} />);
      expect(screen.getByText('Total Tax Rate')).toBeInTheDocument();
      expect(screen.getByText('13.5%')).toBeInTheDocument();
    });

    it('renders permit fee', () => {
      render(<AtAGlance regulation={mockRegulation} />);
      expect(screen.getByText('Permit Fee')).toBeInTheDocument();
      expect(screen.getByText('$520')).toBeInTheDocument();
    });

    it('renders processing time', () => {
      render(<AtAGlance regulation={mockRegulation} />);
      expect(screen.getByText('Processing Time')).toBeInTheDocument();
      expect(screen.getByText('2-4 weeks')).toBeInTheDocument();
    });

    it('renders max fine', () => {
      render(<AtAGlance regulation={mockRegulation} />);
      expect(screen.getByText('Max Fine')).toBeInTheDocument();
      expect(screen.getByText('$15,000')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles regulation with no limits', () => {
      const regNoLimits: Regulation = {
        ...mockRegulation,
        limits: null,
      };
      render(<AtAGlance regulation={regNoLimits} />);
      expect(screen.getByText('Night Limit')).toBeInTheDocument();
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('handles regulation with no primary residence requirement', () => {
      const regNoPR: Regulation = {
        ...mockRegulation,
        eligibility: null,
        registration: {
          city: { required: true },
        },
      };
      render(<AtAGlance regulation={regNoPR} />);
      expect(screen.getByText('Not Required')).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(
        <AtAGlance regulation={mockRegulation} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
