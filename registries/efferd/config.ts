/**
 * Registry Configuration: Efferd
 *
 * Auth, contact, CTA, and other UI blocks
 * Source: https://efferd.com
 *
 * Note: This registry does not have individual JSON endpoints for all items.
 * Some items like 'index' and 'input-group' return 404.
 */

import type { RegistryConfig } from '../../shared/types';

export const config: RegistryConfig = {
  name: 'efferd',
  displayName: 'Efferd',
  description: 'Auth, contact, CTA, and other UI blocks',

  source: {
    baseUrl: 'https://efferd.com/r',
    indexUrl: 'https://efferd.com/r/registry.json',
  },

  sync: {
    retryCount: 3,
    retryDelay: 1000,
    concurrency: 5,
    // These items don't have individual JSON endpoints
    exclude: ['index'],
    include: [],
  },

  output: {
    preserveContent: true,
    generateIndex: true,
  },

  meta: {
    homepage: 'https://efferd.com',
    repository: undefined,
    lastSync: null,
  },
};
