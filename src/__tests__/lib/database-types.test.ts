import { getVideoUrl, getNewsUrl } from '@/types/database';

describe('database URL helpers', () => {
  describe('getVideoUrl()', () => {
    it('should use youtube_video_id for URL', () => {
      const video = {
        youtube_video_id: 'abc123',
      };
      expect(getVideoUrl(video)).toBe('/videos/abc123');
    });

    it('should work with various youtube_video_ids', () => {
      const video = {
        youtube_video_id: 'xyz789',
      };
      expect(getVideoUrl(video)).toBe('/videos/xyz789');
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
