/**
 * Tests for formatting utilities used across the app
 */

// Subscriber count formatting (same logic as in CreatorCard and Creator page)
function formatSubscriberCount(count: number | null): string {
  if (!count) return '';
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${Math.round(count / 1000)}K`;
  }
  return count.toString();
}

// Video duration formatting (same logic as VideoCard)
function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// View count formatting (same logic as VideoCard)
function formatViewCount(count: number | null): string {
  if (!count) return '';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

describe('formatSubscriberCount', () => {
  it('returns empty string for null', () => {
    expect(formatSubscriberCount(null)).toBe('');
  });

  it('returns empty string for 0', () => {
    expect(formatSubscriberCount(0)).toBe('');
  });

  it('formats numbers under 1000 as-is', () => {
    expect(formatSubscriberCount(500)).toBe('500');
    expect(formatSubscriberCount(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatSubscriberCount(1000)).toBe('1K');
    expect(formatSubscriberCount(1500)).toBe('2K'); // rounds
    expect(formatSubscriberCount(125000)).toBe('125K');
    expect(formatSubscriberCount(999000)).toBe('999K');
  });

  it('formats millions with M suffix', () => {
    expect(formatSubscriberCount(1000000)).toBe('1.0M');
    expect(formatSubscriberCount(1500000)).toBe('1.5M');
    expect(formatSubscriberCount(2300000)).toBe('2.3M');
  });
});

describe('formatDuration', () => {
  it('returns empty string for null', () => {
    expect(formatDuration(null)).toBe('');
  });

  it('returns empty string for 0', () => {
    expect(formatDuration(0)).toBe('');
  });

  it('formats seconds under a minute', () => {
    expect(formatDuration(30)).toBe('0:30');
    expect(formatDuration(5)).toBe('0:05');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(3599)).toBe('59:59');
  });

  it('formats hours, minutes, and seconds', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(7325)).toBe('2:02:05');
  });
});

describe('formatViewCount', () => {
  it('returns empty string for null', () => {
    expect(formatViewCount(null)).toBe('');
  });

  it('returns empty string for 0', () => {
    expect(formatViewCount(0)).toBe('');
  });

  it('formats numbers under 1000 as-is', () => {
    expect(formatViewCount(500)).toBe('500');
    expect(formatViewCount(999)).toBe('999');
  });

  it('formats thousands with K suffix and decimal', () => {
    expect(formatViewCount(1000)).toBe('1.0K');
    expect(formatViewCount(1500)).toBe('1.5K');
    expect(formatViewCount(125000)).toBe('125.0K');
  });

  it('formats millions with M suffix and decimal', () => {
    expect(formatViewCount(1000000)).toBe('1.0M');
    expect(formatViewCount(1500000)).toBe('1.5M');
    expect(formatViewCount(2300000)).toBe('2.3M');
  });
});
