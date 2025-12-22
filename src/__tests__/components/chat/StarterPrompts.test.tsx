import { render, screen, fireEvent } from '@testing-library/react';
import { StarterPrompts } from '@/components/chat/StarterPrompts';

describe('StarterPrompts component', () => {
  it('renders the help text', () => {
    render(<StarterPrompts onSelect={jest.fn()} />);
    expect(screen.getByText('Try asking about:')).toBeInTheDocument();
  });

  it('renders all starter prompt buttons', () => {
    render(<StarterPrompts onSelect={jest.fn()} />);
    expect(screen.getByRole('button', { name: /getting started/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pricing strategy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guest communication/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /legal requirements/i })).toBeInTheDocument();
  });

  it('calls onSelect with full prompt when button is clicked', () => {
    const handleSelect = jest.fn();
    render(<StarterPrompts onSelect={handleSelect} />);

    const gettingStartedButton = screen.getByRole('button', { name: /getting started/i });
    fireEvent.click(gettingStartedButton);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(
      'What are the essential steps to start my first Airbnb rental?'
    );
  });

  it('calls onSelect with correct prompt for each button', () => {
    const handleSelect = jest.fn();
    render(<StarterPrompts onSelect={handleSelect} />);

    // Click Pricing Strategy
    fireEvent.click(screen.getByRole('button', { name: /pricing strategy/i }));
    expect(handleSelect).toHaveBeenLastCalledWith(
      'How should I price my short-term rental to maximize bookings and revenue?'
    );

    // Click Guest Communication
    fireEvent.click(screen.getByRole('button', { name: /guest communication/i }));
    expect(handleSelect).toHaveBeenLastCalledWith(
      'What are best practices for guest communication before, during, and after their stay?'
    );

    // Click Legal Requirements
    fireEvent.click(screen.getByRole('button', { name: /legal requirements/i }));
    expect(handleSelect).toHaveBeenLastCalledWith(
      'What permits and licenses do I need to legally operate a short-term rental?'
    );
  });

  it('renders buttons with outline variant styling', () => {
    render(<StarterPrompts onSelect={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      // Outline buttons have border class
      expect(button.className).toMatch(/border/);
    });
  });

  it('renders exactly 4 starter prompt options', () => {
    render(<StarterPrompts onSelect={jest.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });
});
