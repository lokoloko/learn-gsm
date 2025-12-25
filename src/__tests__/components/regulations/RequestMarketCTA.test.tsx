import { render, screen } from '@testing-library/react';
import { RequestMarketCTA } from '@/components/regulations/RequestMarketCTA';

describe('RequestMarketCTA component', () => {
  describe('rendering', () => {
    it('renders heading', () => {
      render(<RequestMarketCTA />);
      expect(screen.getByText(/don't see your market/i)).toBeInTheDocument();
    });

    it('renders description', () => {
      render(<RequestMarketCTA />);
      expect(screen.getByText(/we're constantly adding new markets/i)).toBeInTheDocument();
    });

    it('renders request button', () => {
      render(<RequestMarketCTA />);
      expect(screen.getByRole('link', { name: /request a market/i })).toBeInTheDocument();
    });
  });

  describe('email link', () => {
    it('has correct mailto href', () => {
      render(<RequestMarketCTA />);
      const link = screen.getByRole('link', { name: /request a market/i });
      expect(link).toHaveAttribute(
        'href',
        'mailto:hello@gostudiom.com?subject=Market%20Request%20-%20Learn%20STR'
      );
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(<RequestMarketCTA className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('has icon in the component', () => {
      const { container } = render(<RequestMarketCTA />);
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });
});
