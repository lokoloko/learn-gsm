import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card components', () => {
  describe('Card', () => {
    it('renders with default styling', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-card');
    });

    it('accepts additional className', () => {
      render(<Card className="custom-class">Content</Card>);
      const card = screen.getByText('Content');
      expect(card).toHaveClass('custom-class');
    });

    it('passes through additional props', () => {
      render(<Card id="my-card">Content</Card>);
      expect(screen.getByText('Content')).toHaveAttribute('id', 'my-card');
    });
  });

  describe('CardHeader', () => {
    it('renders with correct spacing', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('space-y-1.5');
      expect(header).toHaveClass('p-6');
    });
  });

  describe('CardTitle', () => {
    it('renders with correct styling', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('leading-none');
    });

    it('accepts additional className', () => {
      render(<CardTitle className="text-xl">Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-xl');
    });
  });

  describe('CardDescription', () => {
    it('renders with muted styling', () => {
      render(<CardDescription>Description</CardDescription>);
      const desc = screen.getByText('Description');
      expect(desc).toHaveClass('text-sm');
      expect(desc).toHaveClass('text-muted-foreground');
    });
  });

  describe('CardContent', () => {
    it('renders with correct padding', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-6');
      expect(content).toHaveClass('pt-0');
    });
  });

  describe('CardFooter', () => {
    it('renders with flex layout', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('p-6');
      expect(footer).toHaveClass('pt-0');
    });
  });

  describe('Card composition', () => {
    it('renders a complete card with all subcomponents', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description here')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });
  });
});
