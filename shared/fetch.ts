/**
 * HTTP Fetch Utilities
 * Provides retry logic and error handling for network requests
 */

import type { SyncConfig } from './types';

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: Pick<SyncConfig, 'retryCount' | 'retryDelay'> = {
  retryCount: 3,
  retryDelay: 1000,
};

const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'shadcn-registries/1.0',
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with retry logic
 * Automatically retries on failure with exponential backoff
 */
export async function fetchWithRetry<T>(
  url: string,
  options?: {
    retries?: number;
    delay?: number;
    headers?: Record<string, string>;
  }
): Promise<T> {
  const retries = options?.retries ?? DEFAULT_CONFIG.retryCount;
  const baseDelay = options?.delay ?? DEFAULT_CONFIG.retryDelay;
  const headers = { ...DEFAULT_HEADERS, ...options?.headers };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        // Exponential backoff: delay * 2^attempt
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error('Unknown fetch error');
}

/**
 * Fetch with timeout
 * Aborts request if it exceeds specified timeout
 */
export async function fetchWithTimeout<T>(
  url: string,
  timeout: number = 30000,
  options?: {
    headers?: Record<string, string>;
  }
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: { ...DEFAULT_HEADERS, ...options?.headers },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check if a URL is accessible
 */
export async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: DEFAULT_HEADERS,
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Build component URL from pattern
 * Supports {baseUrl} and {name} placeholders
 */
export function buildComponentUrl(
  pattern: string,
  baseUrl: string,
  name: string
): string {
  return pattern
    .replace('{baseUrl}', baseUrl)
    .replace('{name}', name);
}
