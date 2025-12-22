import { render, screen } from '@testing-library/react';
import { NewsCard } from '@/components/cards/NewsCard';
import type { NewsArticleWithSource } from '@/types/database';

const mockArticle: NewsArticleWithSource = {
  id: 'article-123',
  slug: 'airbnb-new-regulations-2024-01-abc12345',
  url: 'https://example.com/article',
  title: 'New Airbnb Regulations in 2024',
  summary: 'A comprehensive look at new STR regulations.',
  excerpt: 'New rules are coming...',
  image_url: 'https://example.com/image.jpg',
  category: 'Regulations & Compliance',
  score: 78,
  published_at: '2024-01-20T14:00:00Z',
  primary_location: 'New York, NY',
  is_local_news: true,
  source: [
    {
      name: 'STR News',
      slug: 'str-news',
      logo_url: 'https://example.com/logo.png',
    },
  ],
};

describe('NewsCard component', () => {
  it('renders article title', () => {
    render(<NewsCard article={mockArticle} />);
    expect(screen.getByText('New Airbnb Regulations in 2024')).toBeInTheDocument();
  });

  it('renders article summary', () => {
    render(<NewsCard article={mockArticle} />);
    expect(screen.getByText('A comprehensive look at new STR regulations.')).toBeInTheDocument();
  });

  it('renders article image when available', () => {
    render(<NewsCard article={mockArticle} />);
    const img = screen.getByAltText('New Airbnb Regulations in 2024');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('example.com'));
  });

  it('does not render image section when image_url is null', () => {
    const articleNoImage = { ...mockArticle, image_url: null };
    render(<NewsCard article={articleNoImage} />);
    expect(screen.queryByRole('img', { name: 'New Airbnb Regulations in 2024' })).not.toBeInTheDocument();
  });

  it('renders source info when showSource is true', () => {
    render(<NewsCard article={mockArticle} showSource={true} />);
    expect(screen.getByText('STR News')).toBeInTheDocument();
  });

  it('hides source info when showSource is false', () => {
    render(<NewsCard article={mockArticle} showSource={false} />);
    expect(screen.queryByText('STR News')).not.toBeInTheDocument();
  });

  it('renders location when available', () => {
    render(<NewsCard article={mockArticle} />);
    expect(screen.getByText('New York, NY')).toBeInTheDocument();
  });

  it('renders score when available', () => {
    render(<NewsCard article={mockArticle} />);
    expect(screen.getByText('78')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<NewsCard article={mockArticle} />);
    expect(screen.getByText('Regulations & Compliance')).toBeInTheDocument();
  });

  it('renders Local News badge when is_local_news is true', () => {
    render(<NewsCard article={mockArticle} />);
    expect(screen.getByText('Local News')).toBeInTheDocument();
  });

  it('does not render Local News badge when is_local_news is false', () => {
    const notLocalArticle = { ...mockArticle, is_local_news: false };
    render(<NewsCard article={notLocalArticle} />);
    expect(screen.queryByText('Local News')).not.toBeInTheDocument();
  });

  it('links to correct article URL using slug', () => {
    render(<NewsCard article={mockArticle} />);
    const links = screen.getAllByRole('link');
    const articleLink = links.find(link =>
      link.getAttribute('href')?.includes('/news/')
    );
    expect(articleLink).toHaveAttribute('href', '/news/airbnb-new-regulations-2024-01-abc12345');
  });

  it('links to article using id when slug is null', () => {
    const articleNoSlug = { ...mockArticle, slug: null };
    render(<NewsCard article={articleNoSlug} />);
    const links = screen.getAllByRole('link');
    const articleLink = links.find(link =>
      link.getAttribute('href')?.includes('/news/')
    );
    expect(articleLink).toHaveAttribute('href', '/news/article-123');
  });

  it('links to category page', () => {
    render(<NewsCard article={mockArticle} />);
    const categoryLink = screen.getByRole('link', { name: 'Regulations & Compliance' });
    expect(categoryLink).toHaveAttribute('href', '/topics/regulations-compliance');
  });

  it('renders published date in relative format', () => {
    render(<NewsCard article={mockArticle} />);
    // The date will be rendered relative to now, so we just check it exists
    const dateElement = screen.getByText(/ago/);
    expect(dateElement).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalArticle: NewsArticleWithSource = {
      id: 'min-article',
      slug: 'minimal-article',
      url: 'https://example.com',
      title: 'Minimal Article',
      summary: null,
      excerpt: null,
      image_url: null,
      category: null,
      score: null,
      published_at: null,
      primary_location: null,
      is_local_news: false,
      source: null,
    };

    render(<NewsCard article={minimalArticle} />);
    expect(screen.getByText('Minimal Article')).toBeInTheDocument();
  });
});
