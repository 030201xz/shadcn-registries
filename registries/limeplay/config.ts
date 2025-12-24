/**
 * Registry Configuration: Limeplay
 *
 * Media player UI components
 * Source: https://limeplay.winoffrg.dev
 *
 * Note: This registry has duplicate 'index' items in the registry.json.
 * The sync script will deduplicate items by name.
 */

import type { RegistryConfig } from '../../shared/types';

export const config: RegistryConfig = {
  name: 'limeplay',
  displayName: 'Limeplay',
  description: 'Media player UI components for React applications',

  source: {
    baseUrl: 'https://limeplay.winoffrg.dev/r',
    indexUrl: 'https://limeplay.winoffrg.dev/r/registry.json',
  },

  sync: {
    retryCount: 3,
    retryDelay: 1000,
    concurrency: 5,
    // These items don't have individual JSON endpoints or are duplicates
    exclude: ['index'],
    include: [],
  },

  output: {
    preserveContent: true,
    generateIndex: true,
  },

  meta: {
    homepage: 'https://limeplay.winoffrg.dev',
    repository: undefined,
    lastSync: null,
  },
};
