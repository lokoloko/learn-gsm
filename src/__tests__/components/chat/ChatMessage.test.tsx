import { render, screen } from '@testing-library/react';
import { ChatMessage } from '@/components/chat/ChatMessage';

describe('ChatMessage component', () => {
  describe('User messages', () => {
    it('renders user message content', () => {
      render(<ChatMessage role="user" content="Hello, how do I start?" />);
      expect(screen.getByText('Hello, how do I start?')).toBeInTheDocument();
    });

    it('has correct styling for user messages', () => {
      const { container } = render(<ChatMessage role="user" content="Test" />);
      const messageWrapper = container.firstChild as HTMLElement;
      expect(messageWrapper).toHaveClass('justify-end');
    });

    it('applies primary background to user messages', () => {
      render(<ChatMessage role="user" content="Test" />);
      const message = screen.getByText('Test').closest('div');
      expect(message).toHaveClass('bg-primary');
    });
  });

  describe('Assistant messages', () => {
    it('renders assistant message content', () => {
      render(<ChatMessage role="assistant" content="Here is some advice..." />);
      expect(screen.getByText(/Here is some advice/)).toBeInTheDocument();
    });

    it('has correct styling for assistant messages', () => {
      const { container } = render(<ChatMessage role="assistant" content="Test" />);
      const messageWrapper = container.firstChild as HTMLElement;
      expect(messageWrapper).toHaveClass('justify-start');
    });

    it('applies muted background to assistant messages', () => {
      render(<ChatMessage role="assistant" content="Test" />);
      const message = screen.getByText('Test').closest('.bg-muted');
      expect(message).toBeInTheDocument();
    });
  });

  describe('Markdown formatting', () => {
    it('formats bold text', () => {
      render(<ChatMessage role="assistant" content="This is **bold** text" />);
      const strongElement = document.querySelector('strong');
      expect(strongElement).toHaveTextContent('bold');
    });

    it('formats italic text', () => {
      render(<ChatMessage role="assistant" content="This is *italic* text" />);
      const emElement = document.querySelector('em');
      expect(emElement).toHaveTextContent('italic');
    });

    it('formats inline code', () => {
      render(<ChatMessage role="assistant" content="Use `npm install` command" />);
      const codeElement = document.querySelector('code');
      expect(codeElement).toHaveTextContent('npm install');
    });

    it('formats links', () => {
      render(<ChatMessage role="assistant" content="Check [this link](https://example.com)" />);
      const link = screen.getByRole('link', { name: 'this link' });
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('Streaming state', () => {
    it('applies pulse animation when streaming', () => {
      render(<ChatMessage role="assistant" content="Loading..." isStreaming={true} />);
      const message = screen.getByText('Loading...').closest('.rounded-2xl');
      expect(message).toHaveClass('animate-pulse');
    });

    it('does not apply pulse animation when not streaming', () => {
      render(<ChatMessage role="assistant" content="Done" isStreaming={false} />);
      const message = screen.getByText('Done').closest('.rounded-2xl');
      expect(message).not.toHaveClass('animate-pulse');
    });
  });

  describe('Whitespace handling', () => {
    it('preserves whitespace in user messages', () => {
      render(<ChatMessage role="user" content="Line 1\nLine 2" />);
      const message = screen.getByText(/Line 1/);
      expect(message).toHaveClass('whitespace-pre-wrap');
    });
  });
});
