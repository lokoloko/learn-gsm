import { render, screen } from '@testing-library/react';
import { KnowledgeSection } from '@/components/regulations/KnowledgeSection';
import type { RegulationKnowledge } from '@/types/database';

const mockKnowledge: RegulationKnowledge[] = [
  {
    id: '1',
    regulation_id: 'reg-1',
    jurisdiction_id: 'jur-1',
    knowledge_type: 'eligibility',
    content: 'Must be property owner to apply',
    searchable_text: 'Must be property owner to apply',
    applies_to: null,
    source_id: null,
    created_at: '2024-01-01',
  },
  {
    id: '2',
    regulation_id: 'reg-1',
    jurisdiction_id: 'jur-1',
    knowledge_type: 'eligibility',
    content: 'Single-family homes only',
    searchable_text: 'Single-family homes only',
    applies_to: null,
    source_id: null,
    created_at: '2024-01-01',
  },
  {
    id: '3',
    regulation_id: 'reg-1',
    jurisdiction_id: 'jur-1',
    knowledge_type: 'fee',
    content: 'Annual permit fee is $500',
    searchable_text: 'Annual permit fee is $500',
    applies_to: null,
    source_id: null,
    created_at: '2024-01-01',
  },
  {
    id: '4',
    regulation_id: 'reg-1',
    jurisdiction_id: 'jur-1',
    knowledge_type: 'penalty',
    content: 'First offense: $1,000 fine',
    searchable_text: 'First offense: $1,000 fine',
    applies_to: null,
    source_id: null,
    created_at: '2024-01-01',
  },
];

describe('KnowledgeSection component', () => {
  describe('rendering', () => {
    it('renders the section title', () => {
      render(<KnowledgeSection items={mockKnowledge} />);
      expect(screen.getByText('Regulation Details')).toBeInTheDocument();
    });

    it('renders knowledge items grouped by type', () => {
      render(<KnowledgeSection items={mockKnowledge} />);

      // Eligibility group
      expect(screen.getByText('Eligibility')).toBeInTheDocument();
      expect(screen.getByText('Must be property owner to apply')).toBeInTheDocument();
      expect(screen.getByText('Single-family homes only')).toBeInTheDocument();

      // Fees group
      expect(screen.getByText('Fees & Costs')).toBeInTheDocument();
      expect(screen.getByText('Annual permit fee is $500')).toBeInTheDocument();

      // Penalties group
      expect(screen.getByText('Penalties')).toBeInTheDocument();
      expect(screen.getByText('First offense: $1,000 fine')).toBeInTheDocument();
    });

    it('shows item count in group headers', () => {
      render(<KnowledgeSection items={mockKnowledge} />);
      expect(screen.getByText('(2)')).toBeInTheDocument(); // Eligibility has 2 items
    });
  });

  describe('empty state', () => {
    it('returns null when no items', () => {
      const { container } = render(<KnowledgeSection items={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('ordering', () => {
    it('orders groups by display priority', () => {
      const mixedKnowledge: RegulationKnowledge[] = [
        ...mockKnowledge,
        {
          id: '5',
          regulation_id: 'reg-1',
          jurisdiction_id: 'jur-1',
          knowledge_type: 'requirement',
          content: 'Must display permit number',
          searchable_text: 'Must display permit number',
          applies_to: null,
          source_id: null,
          created_at: '2024-01-01',
        },
      ];

      render(<KnowledgeSection items={mixedKnowledge} />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      const headingTexts = headings.map((h) => h.textContent);

      // Eligibility should come before Requirements which should come before Fees
      const eligibilityIndex = headingTexts.findIndex((t) => t?.includes('Eligibility'));
      const requirementIndex = headingTexts.findIndex((t) => t?.includes('Requirements'));
      const feeIndex = headingTexts.findIndex((t) => t?.includes('Fees'));

      expect(eligibilityIndex).toBeLessThan(requirementIndex);
      expect(requirementIndex).toBeLessThan(feeIndex);
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(
        <KnowledgeSection items={mockKnowledge} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
