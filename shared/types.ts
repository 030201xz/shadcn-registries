/**
 * Shared Type Definitions
 * Core types for registry management
 */

// ============================================================================
// Registry Configuration Types
// ============================================================================

/**
 * Configuration for a single registry
 */
export interface RegistryConfig {
  /** Unique identifier for this registry */
  name: string;
  /** Human-readable display name */
  displayName: string;
  /** Brief description of the registry */
  description: string;

  /** Source registry configuration */
  source: RegistrySource;

  /** Sync configuration */
  sync: SyncConfig;

  /** Output configuration */
  output: OutputConfig;

  /** Registry metadata */
  meta: RegistryMeta;
}

export interface RegistrySource {
  /** Base URL for fetching components */
  baseUrl: string;
  /** URL to fetch registry index (registry.json) */
  indexUrl: string;
  /** Optional: Custom URL pattern for components. Default: {baseUrl}/{name}.json */
  componentUrlPattern?: string;
}

export interface SyncConfig {
  /** Number of retry attempts for failed requests */
  retryCount: number;
  /** Delay between retries in milliseconds */
  retryDelay: number;
  /** Maximum concurrent requests */
  concurrency: number;
  /** Components to exclude from sync */
  exclude: string[];
  /** Components to include (empty = all) */
  include: string[];
}

export interface OutputConfig {
  /** Whether to preserve file content in output JSON */
  preserveContent: boolean;
  /** Whether to generate index.json and registry.json */
  generateIndex: boolean;
}

export interface RegistryMeta {
  /** Registry homepage URL */
  homepage: string;
  /** Source repository URL */
  repository?: string;
  /** Last sync timestamp (ISO 8601) */
  lastSync: string | null;
}

// ============================================================================
// Registry Item Types (shadcn schema)
// ============================================================================

/**
 * A single registry item (component)
 */
export interface RegistryItem {
  /** JSON Schema reference */
  $schema?: string;
  /** Component unique identifier */
  name: string;
  /** Component type */
  type: RegistryItemType;
  /** Human-readable title */
  title?: string;
  /** Component description */
  description?: string;
  /** NPM package dependencies */
  dependencies?: string[];
  /** NPM dev dependencies */
  devDependencies?: string[];
  /** Other registry component dependencies */
  registryDependencies?: string[];
  /** Component files */
  files?: RegistryFile[];
  /** CSS variables definition */
  cssVars?: CssVars;
  /** Additional CSS configuration */
  css?: Record<string, unknown>;
  /** Tailwind configuration */
  tailwind?: Record<string, unknown>;
  /** Custom metadata */
  meta?: Record<string, unknown>;
  /** Documentation content */
  docs?: string;
}

export type RegistryItemType =
  | 'registry:style'
  | 'registry:lib'
  | 'registry:example'
  | 'registry:block'
  | 'registry:component'
  | 'registry:ui'
  | 'registry:hook'
  | 'registry:theme'
  | 'registry:page';

export interface RegistryFile {
  /** File path within the component */
  path: string;
  /** File content (populated by sync) */
  content?: string;
  /** File type */
  type: string;
  /** Target path in user project (~ = project root) */
  target?: string;
}

export interface CssVars {
  /** Theme-level CSS variables */
  theme?: Record<string, string>;
  /** Light mode CSS variables */
  light?: Record<string, string>;
  /** Dark mode CSS variables */
  dark?: Record<string, string>;
}

// ============================================================================
// Registry Index Types
// ============================================================================

/**
 * Registry index file structure (registry.json)
 */
export interface RegistryIndex {
  /** JSON Schema reference */
  $schema?: string;
  /** Registry name */
  name: string;
  /** Registry homepage */
  homepage: string;
  /** List of available items */
  items: RegistryIndexItem[];
}

/**
 * Item entry in registry index (minimal info)
 */
export interface RegistryIndexItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
}

// ============================================================================
// Sync Result Types
// ============================================================================

/**
 * Result of a sync operation
 */
export interface SyncResult {
  /** Successfully synced components */
  success: string[];
  /** Failed components with error messages */
  failed: FailedItem[];
  /** Skipped components (e.g., excluded) */
  skipped: string[];
  /** Sync statistics */
  stats: SyncStats;
}

export interface FailedItem {
  name: string;
  error: string;
}

export interface SyncStats {
  /** Total components found in source */
  total: number;
  /** Successfully synced */
  synced: number;
  /** Failed to sync */
  failed: number;
  /** Skipped (excluded) */
  skipped: number;
  /** Sync duration in milliseconds */
  duration: number;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Verification result for a registry
 */
export interface VerifyResult {
  /** Valid items */
  valid: string[];
  /** Invalid items with errors */
  invalid: { file: string; error: string }[];
}
