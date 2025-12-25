import { render, screen } from '@testing-library/react';
import { LockedContent, LockedPreview } from '@/components/regulations/LockedContent';

describe('LockedContent component', () => {
  describe('signup type', () => {
    it('renders signup title and description', () => {
      render(<LockedContent type="signup" />);

      expect(screen.getByText('Create a free account')).toBeInTheDocument();
      expect(
        screen.getByText(/sign up to see full regulation details/i)
      ).toBeInTheDocument();
    });

    it('renders signup CTA button', () => {
      render(<LockedContent type="signup" />);

      const button = screen.getByRole('button', { name: /sign up free/i });
      expect(button).toBeInTheDocument();
    });

    it('links to signup URL', () => {
      render(<LockedContent type="signup" />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute(
        'href',
        'https://gostudiom.com/signup?ref=learn-regulations'
      );
    });
  });

  describe('upgrade type', () => {
    it('renders upgrade title and description', () => {
      render(<LockedContent type="upgrade" />);

      expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
      expect(
        screen.getByText(/get step-by-step application guides/i)
      ).toBeInTheDocument();
    });

    it('renders upgrade CTA button', () => {
      render(<LockedContent type="upgrade" />);

      const button = screen.getByRole('button', { name: /view plans/i });
      expect(button).toBeInTheDocument();
    });

    it('links to pricing URL', () => {
      render(<LockedContent type="upgrade" />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute(
        'href',
        'https://gostudiom.com/pricing?ref=learn-regulations'
      );
    });
  });

  describe('market-limit type', () => {
    it('renders market limit title and description', () => {
      render(<LockedContent type="market-limit" />);

      expect(screen.getByText('Market limit reached')).toBeInTheDocument();
      expect(
        screen.getByText(/free accounts can view full details for one market/i)
      ).toBeInTheDocument();
    });

    it('shows custom description with market name', () => {
      render(<LockedContent type="market-limit" marketName="Austin, TX" />);

      expect(
        screen.getByText(/you're viewing Austin, TX/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/upgrade to access all markets/i)
      ).toBeInTheDocument();
    });

    it('renders upgrade CTA button', () => {
      render(<LockedContent type="market-limit" />);

      const button = screen.getByRole('button', { name: /upgrade to pro/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('feature label', () => {
    it('renders feature label when provided', () => {
      render(<LockedContent type="signup" featureLabel="Application Steps" />);

      expect(screen.getByText('Unlock: Application Steps')).toBeInTheDocument();
    });

    it('does not render feature label when not provided', () => {
      render(<LockedContent type="signup" />);

      expect(screen.queryByText(/unlock:/i)).not.toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(
        <LockedContent type="signup" className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('LockedPreview component', () => {
  it('renders children with blur', () => {
    render(
      <LockedPreview type="signup">
        <div>Hidden content</div>
      </LockedPreview>
    );

    const blurredContent = screen.getByText('Hidden content');
    expect(blurredContent.closest('.blur-sm')).toBeInTheDocument();
  });

  it('renders locked overlay', () => {
    render(
      <LockedPreview type="signup" featureLabel="Full Details">
        <div>Hidden content</div>
      </LockedPreview>
    );

    expect(screen.getByText('Create a free account')).toBeInTheDocument();
    expect(screen.getByText('Unlock: Full Details')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <LockedPreview type="signup" className="custom-wrapper">
        <div>Content</div>
      </LockedPreview>
    );

    expect(container.firstChild).toHaveClass('custom-wrapper');
  });
});
