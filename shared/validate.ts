/**
 * Validation Utilities
 * Provides validation for registry items and configurations
 */

import type {
  RegistryItem,
  RegistryItemType,
  ValidationResult,
} from './types';

// ============================================================================
// Constants
// ============================================================================

const VALID_ITEM_TYPES: RegistryItemType[] = [
  'registry:style',
  'registry:lib',
  'registry:example',
  'registry:block',
  'registry:component',
  'registry:ui',
  'registry:hook',
  'registry:theme',
  'registry:page',
];

const REGISTRY_ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate a registry item against shadcn schema
 */
export function validateRegistryItem(item: unknown): ValidationResult {
  const warnings: string[] = [];

  // Check if item is an object
  if (!item || typeof item !== 'object') {
    return { valid: false, error: 'Item must be an object' };
  }

  const data = item as Record<string, unknown>;

  // Check $schema
  if (!data.$schema) {
    warnings.push('Missing $schema field');
  } else if (data.$schema !== REGISTRY_ITEM_SCHEMA) {
    warnings.push(`Non-standard $schema: ${data.$schema}`);
  }

  // Check required fields
  if (!data.name || typeof data.name !== 'string') {
    return { valid: false, error: 'Missing or invalid name field' };
  }

  if (!data.type || typeof data.type !== 'string') {
    return { valid: false, error: 'Missing or invalid type field' };
  }

  // Check type is valid
  if (!VALID_ITEM_TYPES.includes(data.type as RegistryItemType)) {
    return { valid: false, error: `Invalid type: ${data.type}` };
  }

  // Validate files array if present
  if (data.files !== undefined) {
    if (!Array.isArray(data.files)) {
      return { valid: false, error: 'files must be an array' };
    }

    for (let i = 0; i < data.files.length; i++) {
      const file = data.files[i] as Record<string, unknown>;

      if (!file.path || typeof file.path !== 'string') {
        return { valid: false, error: `files[${i}]: missing path` };
      }

      if (!file.type || typeof file.type !== 'string') {
        return { valid: false, error: `files[${i}]: missing type` };
      }
    }
  }

  // Validate dependencies if present
  if (data.dependencies !== undefined) {
    if (!Array.isArray(data.dependencies)) {
      return { valid: false, error: 'dependencies must be an array' };
    }
    if (!data.dependencies.every(d => typeof d === 'string')) {
      return { valid: false, error: 'dependencies must be string array' };
    }
  }

  // Validate registryDependencies if present
  if (data.registryDependencies !== undefined) {
    if (!Array.isArray(data.registryDependencies)) {
      return { valid: false, error: 'registryDependencies must be an array' };
    }
    if (!data.registryDependencies.every(d => typeof d === 'string')) {
      return { valid: false, error: 'registryDependencies must be string array' };
    }
  }

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate a registry item from a JSON string
 */
export function validateRegistryItemJson(json: string): ValidationResult {
  try {
    const data = JSON.parse(json);
    return validateRegistryItem(data);
  } catch (error) {
    return {
      valid: false,
      error: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Check if an item has required content for files
 */
export function hasFileContent(item: RegistryItem): boolean {
  if (!item.files || item.files.length === 0) {
    return true; // No files = no content needed
  }

  return item.files.every(file => typeof file.content === 'string');
}

/**
 * Get list of missing file contents
 */
export function getMissingFileContents(item: RegistryItem): string[] {
  if (!item.files) return [];

  return item.files
    .filter(file => typeof file.content !== 'string')
    .map(file => file.path);
}
