/**
 * Registry Configuration: Better Upload
 *
 * File upload components for React
 * Source: https://better-upload.com
 */

import type { RegistryConfig } from '../../shared/types';

export const config: RegistryConfig = {
  name: 'better-upload',
  displayName: 'Better Upload',
  description: 'Beautiful file upload components for React applications',

  source: {
    baseUrl: 'https://better-upload.com/r',
    indexUrl: 'https://better-upload.com/r/registry.json',
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
    homepage: 'https://better-upload.com',
    repository: undefined,
    lastSync: null,
  },
};
