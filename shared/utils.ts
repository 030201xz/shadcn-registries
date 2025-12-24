/**
 * General Utilities
 * Common helper functions for registry management
 */

import { mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { RegistryConfig } from './types';

// ============================================================================
// File System Utilities
// ============================================================================

/**
 * Ensure directory exists, create if not
 */
export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

/**
 * Ensure parent directory of a file exists
 */
export async function ensureParentDir(filePath: string): Promise<void> {
  await ensureDir(dirname(filePath));
}

/**
 * Check if path exists
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if path is a directory
 */
export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * List directories in a path
 */
export async function listDirectories(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

/**
 * List JSON files in a directory
 */
export async function listJsonFiles(path: string): Promise<string[]> {
  const entries = await readdir(path);
  return entries.filter(entry => entry.endsWith('.json'));
}

// ============================================================================
// Registry Utilities
// ============================================================================

/**
 * Get all registry names from registries directory
 */
export async function getRegistryNames(
  registriesDir: string
): Promise<string[]> {
  const dirs = await listDirectories(registriesDir);
  // Exclude template and hidden directories
  return dirs.filter(
    dir => !dir.startsWith('_') && !dir.startsWith('.')
  );
}

/**
 * Load registry configuration
 */
export async function loadRegistryConfig(
  registryDir: string
): Promise<RegistryConfig> {
  const configPath = join(registryDir, 'config.ts');

  // Dynamic import of config module
  const module = await import(configPath);
  return module.config as RegistryConfig;
}

/**
 * Get output directory for a registry
 */
export function getOutputDir(registryDir: string): string {
  return join(registryDir, 'output');
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Slugify a string for use as identifier
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// ============================================================================
// Logging Utilities
// ============================================================================

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
} as const;

/**
 * Log with color
 */
export function log(
  message: string,
  color?: keyof typeof COLORS
): void {
  if (color) {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`);
  } else {
    console.log(message);
  }
}

/**
 * Log success message
 */
export function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green');
}

/**
 * Log error message
 */
export function logError(message: string): void {
  log(`❌ ${message}`, 'red');
}

/**
 * Log warning message
 */
export function logWarning(message: string): void {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Log info message
 */
export function logInfo(message: string): void {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Print a separator line
 */
export function printSeparator(): void {
  log('═'.repeat(65), 'gray');
}

/**
 * Print a header
 */
export function printHeader(title: string): void {
  printSeparator();
  log(`   ${title}`, 'cyan');
  printSeparator();
}

// ============================================================================
// Time Utilities
// ============================================================================

/**
 * Format duration in human readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

/**
 * Get current UTC ISO timestamp
 */
export function getUtcTimestamp(): string {
  return new Date().toISOString();
}
