import { render, screen } from '@testing-library/react';
import { CreatorCard } from '@/components/cards/CreatorCard';
import type { Channel } from '@/types/database';

const mockChannel: Channel = {
  id: 'channel-123',
  channel_id: 'UC123abc',
  title: 'STR Expert',
  description: 'Learn about short-term rentals',
  handle: '@strexpert',
  slug: 'strexpert',
  thumbnail_url: 'https://example.com/avatar.jpg',
  subscriber_count: 125000,
  video_count: 150,
  status: 'active',
  created_at: '2023-01-01T00:00:00Z',
};

describe('CreatorCard component', () => {
  it('renders channel title', () => {
    render(<CreatorCard channel={mockChannel} />);
    expect(screen.getByText('STR Expert')).toBeInTheDocument();
  });

  it('renders channel handle without @ prefix', () => {
    render(<CreatorCard channel={mockChannel} />);
    expect(screen.getByText('@strexpert')).toBeInTheDocument();
  });

  it('renders channel avatar', () => {
    render(<CreatorCard channel={mockChannel} />);
    const img = screen.getByAltText('STR Expert');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('example.com'));
  });

  it('renders fallback avatar when thumbnail_url is null', () => {
    const channelNoThumb = { ...mockChannel, thumbnail_url: null };
    render(<CreatorCard channel={channelNoThumb} />);
    // Should show first letter of title
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('formats subscriber count correctly for thousands', () => {
    render(<CreatorCard channel={mockChannel} />);
    expect(screen.getByText('125K')).toBeInTheDocument();
  });

  it('formats subscriber count correctly for millions', () => {
    const bigChannel = { ...mockChannel, subscriber_count: 1500000 };
    render(<CreatorCard channel={bigChannel} />);
    expect(screen.getByText('1.5M')).toBeInTheDocument();
  });

  it('renders video count', () => {
    render(<CreatorCard channel={mockChannel} />);
    expect(screen.getByText('150 videos')).toBeInTheDocument();
  });

  it('links to correct creator page using slug', () => {
    render(<CreatorCard channel={mockChannel} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/creators/strexpert');
  });

  it('links to creator using channel_id when slug is null', () => {
    const channelNoSlug = { ...mockChannel, slug: null };
    render(<CreatorCard channel={channelNoSlug} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/creators/UC123abc');
  });

  it('hides stats when showStats is false', () => {
    render(<CreatorCard channel={mockChannel} showStats={false} />);
    expect(screen.queryByText('125K')).not.toBeInTheDocument();
    expect(screen.queryByText('150 videos')).not.toBeInTheDocument();
  });

  it('shows stats by default', () => {
    render(<CreatorCard channel={mockChannel} />);
    expect(screen.getByText('125K')).toBeInTheDocument();
    expect(screen.getByText('150 videos')).toBeInTheDocument();
  });

  it('handles missing handle gracefully', () => {
    const channelNoHandle = { ...mockChannel, handle: null };
    render(<CreatorCard channel={channelNoHandle} />);
    expect(screen.getByText('STR Expert')).toBeInTheDocument();
    // Should not crash and handle should not appear
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  it('handles missing subscriber count gracefully', () => {
    const channelNoSubs = { ...mockChannel, subscriber_count: null };
    render(<CreatorCard channel={channelNoSubs} />);
    expect(screen.getByText('STR Expert')).toBeInTheDocument();
    // Should not show subscriber count
    expect(screen.queryByText('K')).not.toBeInTheDocument();
    expect(screen.queryByText('M')).not.toBeInTheDocument();
  });

  it('handles missing video count gracefully', () => {
    const channelNoVideos = { ...mockChannel, video_count: null };
    render(<CreatorCard channel={channelNoVideos} />);
    expect(screen.getByText('STR Expert')).toBeInTheDocument();
    expect(screen.queryByText(/videos/)).not.toBeInTheDocument();
  });

  it('handles channel with handle starting with @', () => {
    const channelWithAt = { ...mockChannel, handle: '@alreadyat' };
    render(<CreatorCard channel={channelWithAt} />);
    // Should display as @alreadyat (not @@alreadyat)
    expect(screen.getByText('@alreadyat')).toBeInTheDocument();
  });
});
