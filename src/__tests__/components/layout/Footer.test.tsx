import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

describe('Footer component', () => {
  it('renders the brand section', () => {
    render(<Footer />);
    expect(screen.getByAltText('GoStudioM')).toBeInTheDocument();
  });

  it('renders the brand tagline', () => {
    render(<Footer />);
    expect(screen.getByText('Built for hosts, by a host')).toBeInTheDocument();
  });

  it('renders Learn section links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Videos' })).toHaveAttribute('href', 'https://learn.gostudiom.com/videos');
    expect(screen.getByRole('link', { name: 'News' })).toHaveAttribute('href', 'https://learn.gostudiom.com/news');
    expect(screen.getByRole('link', { name: 'Topics' })).toHaveAttribute('href', 'https://learn.gostudiom.com/topics');
  });

  it('renders Listing Analyzer section', () => {
    render(<Footer />);
    const getListingScore = screen.getByRole('link', { name: 'Get Listing Score' });
    expect(getListingScore).toHaveAttribute('href', 'https://listings.gostudiom.com');
  });

  it('renders Cleaning Calendar section', () => {
    render(<Footer />);
    const tryCalendar = screen.getByRole('link', { name: 'Try Calendar Free' });
    expect(tryCalendar).toHaveAttribute('href', 'https://gostudiom.com');
  });

  it('renders Financial Analytics section', () => {
    render(<Footer />);
    const seeNumbers = screen.getByRole('link', { name: 'See Your Numbers' });
    expect(seeNumbers).toHaveAttribute('href', 'https://analytics.gostudiom.com');
  });

  it('renders Compare section', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Turno Alternative' })).toHaveAttribute(
      'href',
      'https://gostudiom.com/turno-alternative'
    );
  });

  it('renders Legal section', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      'https://gostudiom.com/privacy'
    );
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute(
      'href',
      'https://gostudiom.com/terms'
    );
  });

  it('renders section headings', () => {
    render(<Footer />);
    expect(screen.getByText('Listing Analyzer')).toBeInTheDocument();
    expect(screen.getByText('Cleaning Calendar')).toBeInTheDocument();
    expect(screen.getByText('Financial Analytics')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText('Compare')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('renders copyright notice with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} GoStudioM. All rights reserved.`)).toBeInTheDocument();
  });
});
