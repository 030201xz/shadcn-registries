/**
 * Registry Configuration: Aceternity UI
 *
 * Beautiful, animated UI components for React
 * Source: https://ui.aceternity.com
 */

import type { RegistryConfig } from '../../shared/types';

export const config: RegistryConfig = {
  name: 'aceternity',
  displayName: 'Aceternity UI',
  description:
    'Beautiful, animated UI components with stunning visual effects for React',

  source: {
    baseUrl: 'https://ui.aceternity.com/registry',
    indexUrl: 'https://ui.aceternity.com/registry.json',
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
    homepage: 'https://ui.aceternity.com',
    repository: 'https://github.com/aceternity/aceternity-ui',
    lastSync: null,
  },
};
