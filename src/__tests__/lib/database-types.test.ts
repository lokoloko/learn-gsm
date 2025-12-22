import { getVideoUrl, getChannelUrl, getNewsUrl } from '@/types/database';

describe('database URL helpers', () => {
  describe('getVideoUrl()', () => {
    it('should use slug when available', () => {
      const video = {
        slug: 'how-to-start-airbnb-abc123',
        youtube_video_id: 'abc123',
      };
      expect(getVideoUrl(video)).toBe('/videos/how-to-start-airbnb-abc123');
    });

    it('should fall back to youtube_video_id when slug is null', () => {
      const video = {
        slug: null,
        youtube_video_id: 'abc123',
      };
      expect(getVideoUrl(video)).toBe('/videos/abc123');
    });

    it('should fall back to youtube_video_id when slug is empty string', () => {
      const video = {
        slug: '',
        youtube_video_id: 'xyz789',
      };
      expect(getVideoUrl(video)).toBe('/videos/xyz789');
    });
  });

  describe('getChannelUrl()', () => {
    it('should use slug when available', () => {
      const channel = {
        slug: 'airbnb-expert',
        channel_id: 'UC123abc',
      };
      expect(getChannelUrl(channel)).toBe('/creators/airbnb-expert');
    });

    it('should fall back to channel_id when slug is null', () => {
      const channel = {
        slug: null,
        channel_id: 'UC123abc',
      };
      expect(getChannelUrl(channel)).toBe('/creators/UC123abc');
    });

    it('should fall back to channel_id when slug is empty string', () => {
      const channel = {
        slug: '',
        channel_id: 'UCxyz789',
      };
      expect(getChannelUrl(channel)).toBe('/creators/UCxyz789');
    });
  });

  describe('getNewsUrl()', () => {
    it('should use slug when available', () => {
      const article = {
        slug: 'airbnb-regulations-update-2024-01',
        id: 'uuid-123',
      };
      expect(getNewsUrl(article)).toBe('/news/airbnb-regulations-update-2024-01');
    });

    it('should fall back to id when slug is null', () => {
      const article = {
        slug: null,
        id: 'uuid-123',
      };
      expect(getNewsUrl(article)).toBe('/news/uuid-123');
    });

    it('should fall back to id when slug is empty string', () => {
      const article = {
        slug: '',
        id: 'uuid-456',
      };
      expect(getNewsUrl(article)).toBe('/news/uuid-456');
    });
  });
});
