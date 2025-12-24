/**
 * Registry Configuration: Assistant UI
 *
 * AI Chat UI Library - Official shadcn components
 * Source: https://assistant-ui.com
 */

import type { RegistryConfig } from '../../shared/types';

export const config: RegistryConfig = {
  name: 'assistant-ui',
  displayName: 'Assistant UI',
  description:
    'AI Chat UI Library - React components for building AI chat interfaces',

  source: {
    baseUrl: 'https://r.assistant-ui.com',
    indexUrl: 'https://r.assistant-ui.com/registry.json',
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
    homepage: 'https://assistant-ui.com',
    repository: 'https://github.com/assistant-ui/assistant-ui',
    lastSync: null,
  },
};
