import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/Header';

describe('Header component', () => {
  it('renders the logo', () => {
    render(<Header />);
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('Learn STR')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /videos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /news/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /topics/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /creators/i })).toBeInTheDocument();
  });

  it('has correct href for navigation links', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /videos/i })).toHaveAttribute('href', '/videos');
    expect(screen.getByRole('link', { name: /news/i })).toHaveAttribute('href', '/news');
    expect(screen.getByRole('link', { name: /topics/i })).toHaveAttribute('href', '/topics');
    expect(screen.getByRole('link', { name: /creators/i })).toHaveAttribute('href', '/creators');
  });

  it('renders Ask AI button with link to chat', () => {
    render(<Header />);
    const chatLinks = screen.getAllByRole('link', { name: /ask ai/i });
    expect(chatLinks.length).toBeGreaterThan(0);
    expect(chatLinks[0]).toHaveAttribute('href', '/chat');
  });

  it('renders mobile menu button', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('toggles mobile menu on button click', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });

    // Menu should be closed initially - only desktop nav links visible
    const initialLinks = screen.getAllByRole('link', { name: /videos/i });
    expect(initialLinks.length).toBe(1); // Only desktop nav

    // Open menu
    fireEvent.click(menuButton);

    // Menu should now be open - both desktop and mobile nav links visible
    const openedLinks = screen.getAllByRole('link', { name: /videos/i });
    expect(openedLinks.length).toBe(2); // Desktop + mobile nav
  });

  it('closes mobile menu when a link is clicked', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });

    // Open menu
    fireEvent.click(menuButton);

    // Click a mobile nav link
    const mobileLinks = screen.getAllByRole('link', { name: /topics/i });
    fireEvent.click(mobileLinks[1]); // Click mobile version

    // Menu should be closed - only desktop nav visible
    const closedLinks = screen.getAllByRole('link', { name: /topics/i });
    expect(closedLinks.length).toBe(1);
  });

  it('renders logo link to homepage', () => {
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: /learn str/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
