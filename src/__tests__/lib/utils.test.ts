import { cn } from '@/lib/utils';

describe('cn() utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar')).toBe('foo');
    expect(cn('foo', true && 'bar')).toBe('foo bar');
  });

  it('should handle undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('should handle null values', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar');
  });

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('should handle objects', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo');
  });

  it('should merge tailwind classes correctly', () => {
    // Later classes should override earlier ones
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle complex tailwind merging', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe('hover:bg-blue-500');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('should handle mixed input types', () => {
    expect(
      cn('base-class', { active: true, disabled: false }, ['extra', 'classes'])
    ).toBe('base-class active extra classes');
  });
});
