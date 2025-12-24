/**
 * Registry Configuration: AI Elements
 *
 * AI-powered UI components from Vercel AI SDK
 * Source: https://registry.ai-sdk.dev
 */

import type { RegistryConfig } from '../../shared/types';

export const config: RegistryConfig = {
  name: 'ai-elements',
  displayName: 'AI Elements',
  description:
    'AI-powered UI components for building AI applications with Vercel AI SDK',

  source: {
    baseUrl: 'https://registry.ai-sdk.dev',
    indexUrl: 'https://registry.ai-sdk.dev/registry.json',
  },

  sync: {
    retryCount: 3,
    retryDelay: 1000,
    concurrency: 5,
    exclude: [],
    include: [],
  },

  output: {
    preserveContent: true,
    generateIndex: true,
  },

  meta: {
    homepage: 'https://registry.ai-sdk.dev/elements',
    repository: 'https://github.com/vercel/ai',
    lastSync: null,
  },
};
