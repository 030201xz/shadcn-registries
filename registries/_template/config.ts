/**
 * Registry Configuration Template
 *
 * Copy this directory to create a new registry.
 * Update all TODO placeholders with actual values.
 */

import type { RegistryConfig } from '../../shared/types';

export const config: RegistryConfig = {
  // TODO: Update with registry identifier (lowercase, hyphenated)
  name: 'template',
  // TODO: Human-readable name
  displayName: 'Template Registry',
  // TODO: Brief description
  description: 'TODO: Add description for this registry',

  source: {
    // TODO: Base URL for fetching component JSON files
    baseUrl: 'https://example.com/registry',
    // TODO: URL to fetch registry index (registry.json)
    indexUrl: 'https://example.com/registry/registry.json',
    // Optional: Custom URL pattern. Default: {baseUrl}/{name}.json
    // componentUrlPattern: '{baseUrl}/r/{name}.json',
  },

  sync: {
    // Number of retry attempts for failed requests
    retryCount: 3,
    // Base delay between retries (exponential backoff applied)
    retryDelay: 1000,
    // Maximum concurrent requests
    concurrency: 5,
    // Components to exclude from sync (empty = none)
    exclude: [],
    // Components to include (empty = all)
    include: [],
  },

  output: {
    // Whether to include file content in output JSON
    preserveContent: true,
    // Whether to generate index.json and registry.json
    generateIndex: true,
  },

  meta: {
    // TODO: Registry homepage
    homepage: 'https://example.com',
    // TODO: Source repository (optional)
    repository: 'https://github.com/example/repo',
    // Auto-updated by sync script
    lastSync: null,
  },
};
