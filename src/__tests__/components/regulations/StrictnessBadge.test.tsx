import { render, screen } from '@testing-library/react';
import { StrictnessBadge } from '@/components/regulations/StrictnessBadge';
import { STRICTNESS_META, type StrictnessLevel } from '@/lib/utils/regulations';

describe('StrictnessBadge component', () => {
  describe('rendering', () => {
    it('renders strict badge with correct label', () => {
      render(<StrictnessBadge level="strict" />);
      expect(screen.getByText('Strict')).toBeInTheDocument();
    });

    it('renders moderate badge with correct label', () => {
      render(<StrictnessBadge level="moderate" />);
      expect(screen.getByText('Moderate')).toBeInTheDocument();
    });

    it('renders permissive badge with correct label', () => {
      render(<StrictnessBadge level="permissive" />);
      expect(screen.getByText('Permissive')).toBeInTheDocument();
    });
  });

  describe('showLabel prop', () => {
    it('shows label by default', () => {
      render(<StrictnessBadge level="strict" />);
      expect(screen.getByText('Strict')).toBeInTheDocument();
    });

    it('hides label when showLabel is false', () => {
      render(<StrictnessBadge level="strict" showLabel={false} />);
      expect(screen.queryByText('Strict')).not.toBeInTheDocument();
    });
  });

  describe('showIcon prop', () => {
    it('shows icon by default', () => {
      const { container } = render(<StrictnessBadge level="strict" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      const { container } = render(<StrictnessBadge level="strict" showIcon={false} />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });
  });

  describe('size prop', () => {
    it('applies small size classes', () => {
      const { container } = render(<StrictnessBadge level="strict" size="sm" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-xs');
    });

    it('applies medium size classes by default', () => {
      const { container } = render(<StrictnessBadge level="strict" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-sm');
    });

    it('applies large size classes', () => {
      const { container } = render(<StrictnessBadge level="strict" size="lg" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-base');
    });
  });

  describe('styling', () => {
    const levels: StrictnessLevel[] = ['strict', 'moderate', 'permissive'];

    levels.forEach((level) => {
      it(`applies correct color classes for ${level}`, () => {
        const { container } = render(<StrictnessBadge level={level} />);
        const badge = container.firstChild;
        const meta = STRICTNESS_META[level];

        // Check that color class is applied (split by space since it might have multiple classes)
        const colorClasses = meta.color.split(' ');
        colorClasses.forEach((colorClass) => {
          expect(badge).toHaveClass(colorClass);
        });
      });

      it(`applies correct background classes for ${level}`, () => {
        const { container } = render(<StrictnessBadge level={level} />);
        const badge = container.firstChild;
        const meta = STRICTNESS_META[level];

        const bgClasses = meta.bgColor.split(' ');
        bgClasses.forEach((bgClass) => {
          expect(badge).toHaveClass(bgClass);
        });
      });
    });
  });

  describe('accessibility', () => {
    it('has title attribute with description', () => {
      const { container } = render(<StrictnessBadge level="strict" />);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute('title', STRICTNESS_META.strict.description);
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(
        <StrictnessBadge level="strict" className="custom-class" />
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      const { container } = render(
        <StrictnessBadge level="strict" className="custom-class" />
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('rounded-full');
    });
  });
});
