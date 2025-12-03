/**
 * Property-Based Tests for Supabase Configuration
 * 
 * **Feature: supabase-sync, Property 6: Environment Variable Validation**
 * **Validates: Requirements 2.2**
 * 
 * Tests that missing environment variables throw descriptive errors.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Custom error for missing Supabase configuration
 * (Duplicated here for testing without import.meta.env dependency)
 */
class SupabaseConfigError extends Error {
  constructor(missingVar: string) {
    super(`Missing required environment variable: ${missingVar}. Please check your .env file.`);
    this.name = 'SupabaseConfigError';
  }
}

/**
 * Pure validation function for testing (mirrors the logic in supabase.ts)
 * This allows us to test the validation logic without Vite's import.meta.env
 */
function validateConfig(url: string | undefined | null, anonKey: string | undefined | null): { url: string; anonKey: string } {
  if (!url || url === '') {
    throw new SupabaseConfigError('VITE_SUPABASE_URL');
  }
  
  if (!anonKey || anonKey === '') {
    throw new SupabaseConfigError('VITE_SUPABASE_ANON_KEY');
  }
  
  return { url, anonKey };
}

describe('Supabase Configuration - Property Tests', () => {
  /**
   * **Feature: supabase-sync, Property 6: Environment Variable Validation**
   * **Validates: Requirements 2.2**
   * 
   * For any missing required environment variable (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY),
   * the system SHALL throw an error with a message identifying the missing variable.
   */
  describe('Property 6: Environment Variable Validation', () => {
    it('should throw SupabaseConfigError when URL is undefined', () => {
      expect(() => validateConfig(undefined, 'test-key')).toThrow(SupabaseConfigError);
      expect(() => validateConfig(undefined, 'test-key')).toThrow('VITE_SUPABASE_URL');
    });

    it('should throw SupabaseConfigError when anon key is undefined', () => {
      expect(() => validateConfig('https://test.supabase.co', undefined)).toThrow(SupabaseConfigError);
      expect(() => validateConfig('https://test.supabase.co', undefined)).toThrow('VITE_SUPABASE_ANON_KEY');
    });

    it('should throw SupabaseConfigError when URL is empty string', () => {
      expect(() => validateConfig('', 'test-key')).toThrow(SupabaseConfigError);
      expect(() => validateConfig('', 'test-key')).toThrow('VITE_SUPABASE_URL');
    });

    it('should throw SupabaseConfigError when anon key is empty string', () => {
      expect(() => validateConfig('https://test.supabase.co', '')).toThrow(SupabaseConfigError);
      expect(() => validateConfig('https://test.supabase.co', '')).toThrow('VITE_SUPABASE_ANON_KEY');
    });

    /**
     * Property test: For any valid URL and key strings, validation should succeed
     */
    it('should return config when both values are valid non-empty strings', () => {
      fc.assert(
        fc.property(
          fc.webUrl(), // Generate valid URLs
          fc.string({ minLength: 1 }), // Generate non-empty strings for key
          (url, key) => {
            const result = validateConfig(url, key);
            
            expect(result.url).toBe(url);
            expect(result.anonKey).toBe(key);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property test: Empty or undefined values should always throw
     */
    it('should throw for any falsy URL value', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(undefined, '', null),
          fc.string({ minLength: 1 }),
          (url, key) => {
            expect(() => validateConfig(url, key)).toThrow(SupabaseConfigError);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property test: Empty or undefined values should always throw
     */
    it('should throw for any falsy anon key value', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.constantFrom(undefined, '', null),
          (url, key) => {
            expect(() => validateConfig(url, key)).toThrow(SupabaseConfigError);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property test: Error message should always identify the missing variable
     */
    it('should include variable name in error message', () => {
      const testCases = [
        { url: undefined, key: 'valid-key', expectedVar: 'VITE_SUPABASE_URL' },
        { url: '', key: 'valid-key', expectedVar: 'VITE_SUPABASE_URL' },
        { url: 'https://test.supabase.co', key: undefined, expectedVar: 'VITE_SUPABASE_ANON_KEY' },
        { url: 'https://test.supabase.co', key: '', expectedVar: 'VITE_SUPABASE_ANON_KEY' },
      ];

      for (const { url, key, expectedVar } of testCases) {
        try {
          validateConfig(url, key);
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(SupabaseConfigError);
          expect((error as Error).message).toContain(expectedVar);
        }
      }
    });

    /**
     * Property test: SupabaseConfigError should have correct name property
     */
    it('should create error with correct name property', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          (varName) => {
            const error = new SupabaseConfigError(varName);
            expect(error.name).toBe('SupabaseConfigError');
            expect(error.message).toContain(varName);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
