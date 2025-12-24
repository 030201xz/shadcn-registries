/**
 * Registry Configuration: BillingSDK
 *
 * Pricing and billing UI components
 * Source: https://billingsdk.com
 */

import type { RegistryConfig } from '../../shared/types';

export const config: RegistryConfig = {
  name: 'billingsdk',
  displayName: 'BillingSDK',
  description:
    'Pricing tables, subscription management, and billing UI components',

  source: {
    baseUrl: 'https://billingsdk.com/r',
    indexUrl: 'https://billingsdk.com/r/registry.json',
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
    homepage: 'https://billingsdk.com',
    repository: undefined,
    lastSync: null,
  },
};
