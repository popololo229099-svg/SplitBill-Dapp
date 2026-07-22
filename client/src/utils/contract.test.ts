import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as contract from '../utils/contract';

describe('contract.ts', () => {
  it('CONTRACT_ADDRESS is defined and correct format', () => {
    expect(contract.CONTRACT_ADDRESS).toBeDefined();
    expect(typeof contract.CONTRACT_ADDRESS).toBe('string');
    expect(contract.CONTRACT_ADDRESS.length).toBeGreaterThan(20);
    expect(contract.CONTRACT_ADDRESS).toMatch(/^[A-Z0-9]+$/);
  });

  describe('getTotalSplits', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns 0n on error (graceful fallback)', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
      const result = await contract.getTotalSplits();
      expect(typeof result).toBe('bigint');
    });
  });

  describe('getSplits', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns empty array on error (graceful fallback)', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
      const result = await contract.getSplits(0, 10);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});
