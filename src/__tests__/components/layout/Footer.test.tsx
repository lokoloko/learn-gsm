import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

describe('Footer component', () => {
  it('renders the brand section', () => {
    render(<Footer />);
    expect(screen.getByAltText('GoStudioM')).toBeInTheDocument();
  });

  it('renders the brand description', () => {
    render(<Footer />);
    expect(
      screen.getByText(/the knowledge hub for short-term rental hosts/i)
    ).toBeInTheDocument();
  });

  it('renders Resources section links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Videos' })).toHaveAttribute('href', '/videos');
    expect(screen.getByRole('link', { name: 'News' })).toHaveAttribute('href', '/news');
    expect(screen.getByRole('link', { name: 'Topics' })).toHaveAttribute('href', '/topics');
  });

  it('renders Free Tools section with external links', () => {
    render(<Footer />);
    const listingAnalyzer = screen.getByRole('link', { name: 'Listing Analyzer' });
    expect(listingAnalyzer).toHaveAttribute('href', 'https://listings.gostudiom.com');
    expect(listingAnalyzer).toHaveAttribute('target', '_blank');
    expect(listingAnalyzer).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders Company section with mixed internal/external links', () => {
    render(<Footer />);

    // External link
    const aboutLink = screen.getByRole('link', { name: 'About GoStudioM' });
    expect(aboutLink).toHaveAttribute('href', 'https://gostudiom.com/about');
    expect(aboutLink).toHaveAttribute('target', '_blank');

    // Internal links
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/privacy'
    );
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute(
      'href',
      '/terms'
    );
  });

  it('renders section headings', () => {
    render(<Footer />);
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Free Tools')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  it('renders copyright notice with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} GoStudioM. All rights reserved.`)).toBeInTheDocument();
  });

  it('renders GoStudioM Platform link', () => {
    render(<Footer />);
    const platformLink = screen.getByRole('link', { name: 'GoStudioM Platform' });
    expect(platformLink).toHaveAttribute('href', 'https://gostudiom.com');
    expect(platformLink).toHaveAttribute('target', '_blank');
  });

  it('renders logo link to homepage', () => {
    render(<Footer />);
    // The logo is a link with "Learn STR" text
    const logoLinks = screen.getAllByRole('link');
    const logoLink = logoLinks.find((link) => link.getAttribute('href') === '/');
    expect(logoLink).toBeInTheDocument();
  });
});
