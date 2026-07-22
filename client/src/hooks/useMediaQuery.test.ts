import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery, useIsMobile, useIsTablet } from '../hooks/useMediaQuery';
import React from 'react';
import { createElement } from 'react';

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement('div', null, children);
}

function mockMatchMedia(matches: boolean) {
  const mockMql = {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue(mockMql),
  });
  return mockMql;
}

describe('useMediaQuery', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('returns true when media query matches', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'), { wrapper });
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 640px)');
  });

  it('returns false when media query does not match', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 640px)'), { wrapper });
    expect(result.current).toBe(false);
  });

  it('cleans up event listener on unmount', () => {
    const mockMql = mockMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 640px)'), { wrapper });
    unmount();
    expect(mockMql.removeEventListener).toHaveBeenCalled();
  });
});

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('returns true for mobile viewport', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsMobile(), { wrapper });
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 640px)');
  });

  it('returns false for desktop viewport', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile(), { wrapper });
    expect(result.current).toBe(false);
  });
});

describe('useIsTablet', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('returns true for tablet viewport', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsTablet(), { wrapper });
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1024px)');
  });
});
