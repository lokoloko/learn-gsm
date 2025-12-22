import { render, screen } from '@testing-library/react';
import { VideoCard } from '@/components/cards/VideoCard';
import type { VideoWithChannel } from '@/types/database';

const mockVideo: VideoWithChannel = {
  id: 'video-123',
  slug: 'how-to-start-airbnb-xyz123',
  youtube_video_id: 'xyz123',
  channel_id: 'channel-456',
  channel_title: 'STR Expert',
  title: 'How to Start Your Airbnb Business',
  thumbnail_url: 'https://example.com/thumb.jpg',
  summary: 'Learn the basics of starting an Airbnb',
  category: 'Getting Started',
  skill_level: 'beginner',
  score: 85,
  duration: 3600,
  view_count: 150000,
  published_at: '2024-01-15T10:00:00Z',
  channel: [
    {
      slug: 'str-expert',
      title: 'STR Expert Channel',
      thumbnail_url: 'https://example.com/channel.jpg',
    },
  ],
};

describe('VideoCard component', () => {
  it('renders video title', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByText('How to Start Your Airbnb Business')).toBeInTheDocument();
  });

  it('renders video thumbnail', () => {
    render(<VideoCard video={mockVideo} />);
    const img = screen.getByAltText('How to Start Your Airbnb Business');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining('example.com'));
  });

  it('uses YouTube thumbnail as fallback when thumbnail_url is missing', () => {
    const videoWithoutThumb = { ...mockVideo, thumbnail_url: null };
    render(<VideoCard video={videoWithoutThumb} />);
    const img = screen.getByAltText('How to Start Your Airbnb Business');
    expect(img).toHaveAttribute('src', expect.stringContaining('youtube.com'));
  });

  it('renders channel info when showChannel is true', () => {
    render(<VideoCard video={mockVideo} showChannel={true} />);
    expect(screen.getByText('STR Expert Channel')).toBeInTheDocument();
  });

  it('hides channel info when showChannel is false', () => {
    render(<VideoCard video={mockVideo} showChannel={false} />);
    expect(screen.queryByText('STR Expert Channel')).not.toBeInTheDocument();
  });

  it('renders duration', () => {
    render(<VideoCard video={mockVideo} />);
    // 3600 seconds = 1:00:00
    expect(screen.getByText('1:00:00')).toBeInTheDocument();
  });

  it('formats view count correctly', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByText(/150\.0K views/)).toBeInTheDocument();
  });

  it('renders score', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('renders skill level badge', () => {
    render(<VideoCard video={mockVideo} />);
    expect(screen.getByText('beginner')).toBeInTheDocument();
  });

  it('links to correct video URL using slug', () => {
    render(<VideoCard video={mockVideo} />);
    const links = screen.getAllByRole('link');
    const videoLink = links.find(link =>
      link.getAttribute('href')?.includes('/videos/')
    );
    expect(videoLink).toHaveAttribute('href', '/videos/how-to-start-airbnb-xyz123');
  });

  it('links to video using youtube_video_id when slug is null', () => {
    const videoNoSlug = { ...mockVideo, slug: null };
    render(<VideoCard video={videoNoSlug} />);
    const links = screen.getAllByRole('link');
    const videoLink = links.find(link =>
      link.getAttribute('href')?.includes('/videos/')
    );
    expect(videoLink).toHaveAttribute('href', '/videos/xyz123');
  });

  it('links to category page', () => {
    render(<VideoCard video={mockVideo} />);
    const categoryLink = screen.getByRole('link', { name: 'Getting Started' });
    expect(categoryLink).toHaveAttribute('href', '/topics/getting-started');
  });

  it('handles missing optional fields gracefully', () => {
    const minimalVideo: VideoWithChannel = {
      id: 'min-video',
      slug: 'minimal-video',
      youtube_video_id: 'min123',
      channel_id: null,
      channel_title: null,
      title: 'Minimal Video',
      thumbnail_url: null,
      summary: null,
      category: null,
      skill_level: 'beginner',
      score: 0,
      duration: null,
      view_count: null,
      published_at: null,
      channel: null,
    };

    render(<VideoCard video={minimalVideo} />);
    expect(screen.getByText('Minimal Video')).toBeInTheDocument();
  });
});
