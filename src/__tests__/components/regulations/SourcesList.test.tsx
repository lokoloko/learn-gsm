import { render, screen } from '@testing-library/react';
import { SourcesList } from '@/components/regulations/SourcesList';
import type { RegulationSource } from '@/types/database';

const mockSources: RegulationSource[] = [
  {
    id: '1',
    jurisdiction_id: 'jur-1',
    url: 'https://www.cityofmiamibeach.gov/str-regulations',
    source_type: 'government',
    source_name: 'City of Miami Beach STR Page',
    scrape_method: 'playwright',
    scrape_frequency: 'weekly',
    last_scraped_at: '2024-01-15',
    last_changed_at: null,
    last_error: null,
    error_count: 0,
    status: 'active',
    notes: null,
    added_by: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
  },
  {
    id: '2',
    jurisdiction_id: 'jur-1',
    url: 'https://municode.com/miami-beach/ordinance-2023-45',
    source_type: 'ordinance',
    source_name: 'Ordinance 2023-45',
    scrape_method: 'playwright',
    scrape_frequency: 'monthly',
    last_scraped_at: '2024-01-10',
    last_changed_at: null,
    last_error: null,
    error_count: 0,
    status: 'active',
    notes: null,
    added_by: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-10',
  },
];

describe('SourcesList component', () => {
  describe('rendering', () => {
    it('renders the section title', () => {
      render(<SourcesList sources={mockSources} />);
      expect(screen.getByText('Official Sources')).toBeInTheDocument();
    });

    it('renders source names', () => {
      render(<SourcesList sources={mockSources} />);
      expect(screen.getByText('City of Miami Beach STR Page')).toBeInTheDocument();
      expect(screen.getByText('Ordinance 2023-45')).toBeInTheDocument();
    });

    it('renders domain from URL', () => {
      render(<SourcesList sources={mockSources} />);
      expect(screen.getByText('cityofmiamibeach.gov')).toBeInTheDocument();
      expect(screen.getByText('municode.com')).toBeInTheDocument();
    });

    it('renders disclaimer text', () => {
      render(<SourcesList sources={mockSources} />);
      expect(
        screen.getByText(/information sourced from official government websites/i)
      ).toBeInTheDocument();
    });
  });

  describe('links', () => {
    it('renders external links with correct href', () => {
      render(<SourcesList sources={mockSources} />);
      const links = screen.getAllByRole('link');

      expect(links[0]).toHaveAttribute(
        'href',
        'https://www.cityofmiamibeach.gov/str-regulations'
      );
      expect(links[1]).toHaveAttribute(
        'href',
        'https://municode.com/miami-beach/ordinance-2023-45'
      );
    });

    it('links open in new tab', () => {
      render(<SourcesList sources={mockSources} />);
      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('empty state', () => {
    it('returns null when no sources', () => {
      const { container } = render(<SourcesList sources={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('fallback source name', () => {
    it('uses source_type as fallback when source_name is null', () => {
      const sourcesNoName: RegulationSource[] = [
        {
          ...mockSources[0],
          source_name: null,
        },
      ];
      render(<SourcesList sources={sourcesNoName} />);
      expect(screen.getByText('government')).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(
        <SourcesList sources={mockSources} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
