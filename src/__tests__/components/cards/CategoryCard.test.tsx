import { render, screen } from '@testing-library/react';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { CATEGORY_META } from '@/lib/utils/categories';

describe('CategoryCard component', () => {
  it('renders category name', () => {
    render(<CategoryCard slug="getting-started" />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('renders category description', () => {
    render(<CategoryCard slug="getting-started" />);
    expect(screen.getByText(CATEGORY_META['getting-started'].description)).toBeInTheDocument();
  });

  it('links to correct topic page', () => {
    render(<CategoryCard slug="your-listing" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/topics/your-listing');
  });

  it('renders all category slugs correctly', () => {
    const slugs = [
      'getting-started',
      'your-listing',
      'pricing-profitability',
      'hosting-operations',
      'regulations-compliance',
      'growth-marketing',
    ] as const;

    slugs.forEach((slug) => {
      const { unmount } = render(<CategoryCard slug={slug} />);
      expect(screen.getByText(CATEGORY_META[slug].name)).toBeInTheDocument();
      expect(screen.getByText(CATEGORY_META[slug].description)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders video count when provided', () => {
    render(<CategoryCard slug="getting-started" videoCount={42} />);
    expect(screen.getByText('42 videos')).toBeInTheDocument();
  });

  it('renders news count when provided', () => {
    render(<CategoryCard slug="getting-started" newsCount={15} />);
    expect(screen.getByText('15 articles')).toBeInTheDocument();
  });

  it('renders both counts when provided', () => {
    render(<CategoryCard slug="getting-started" videoCount={42} newsCount={15} />);
    expect(screen.getByText('42 videos')).toBeInTheDocument();
    expect(screen.getByText('15 articles')).toBeInTheDocument();
  });

  it('does not render counts section when no counts provided', () => {
    render(<CategoryCard slug="getting-started" />);
    expect(screen.queryByText(/videos/)).not.toBeInTheDocument();
    expect(screen.queryByText(/articles/)).not.toBeInTheDocument();
  });

  it('renders count even when zero', () => {
    render(<CategoryCard slug="getting-started" videoCount={0} />);
    expect(screen.getByText('0 videos')).toBeInTheDocument();
  });
});
