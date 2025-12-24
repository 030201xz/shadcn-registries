/**
 * Registry Configuration: Blocks
 *
 * Ready-to-use UI blocks for rapid development
 * Source: https://blocks.so
 */

import type { RegistryConfig } from '../../shared/types';

export const config: RegistryConfig = {
  name: 'blocks',
  displayName: 'Blocks',
  description: 'Ready-to-use UI blocks for rapid development',

  source: {
    baseUrl: 'https://blocks.so/r',
    indexUrl: 'https://blocks.so/r/registry.json',
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
    homepage: 'https://blocks.so',
    repository: undefined,
    lastSync: null,
  },
};
