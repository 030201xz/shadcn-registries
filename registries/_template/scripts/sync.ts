/**
 * Sync Script Template
 *
 * Usage:
 *   bun run registries/{name}/scripts/sync.ts
 *   bun run registries/{name}/scripts/sync.ts --only=component1,component2
 *   bun run registries/{name}/scripts/sync.ts --dry-run
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { config } from '../config';
import {
  fetchWithRetry,
  validateRegistryItem,
  ensureParentDir,
  logSuccess,
  logError,
  logInfo,
  printHeader,
  formatDuration,
  getUtcTimestamp,
} from '../../../shared';
import type {
  RegistryItem,
  RegistryIndex,
  SyncResult,
} from '../../../shared';

// ============================================================================
// Configuration
// ============================================================================

const OUTPUT_DIR = join(import.meta.dir, '..', 'output');

// ============================================================================
// Argument Parsing
// ============================================================================

interface SyncOptions {
  only: string[];
  dryRun: boolean;
}

function parseArgs(): SyncOptions {
  const args = process.argv.slice(2);
  const only: string[] = [];
  let dryRun = false;

  for (const arg of args) {
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg.startsWith('--only=')) {
      only.push(
        ...arg
          .slice(7)
          .split(',')
          .map(s => s.trim())
      );
    }
  }

  return { only, dryRun };
}

// ============================================================================
// Custom Logic Area
// Override these functions if registry requires special handling
// ============================================================================

/**
 * Fetch registry index
 * Default: GET indexUrl and return items array
 *
 * Override if:
 * - Registry uses different index format
 * - Need to scrape from website
 * - Need to merge multiple sources
 */
async function fetchRegistryIndex(): Promise<RegistryItem[]> {
  const data = await fetchWithRetry<RegistryIndex>(
    config.source.indexUrl
  );
  return data.items as RegistryItem[];
}

/**
 * Fetch single component detail
 * Default: GET {baseUrl}/{name}.json
 *
 * Override if:
 * - Registry uses different URL pattern
 * - Need authentication
 * - Need to transform URL (e.g., handle nested paths)
 */
async function fetchComponentDetail(
  name: string
): Promise<RegistryItem> {
  const url = `${config.source.baseUrl}/${name}.json`;
  return await fetchWithRetry<RegistryItem>(url);
}

/**
 * Transform/fix component data if needed
 * Default: no transformation
 *
 * Override if:
 * - Need to fix missing $schema
 * - Need to normalize type values
 * - Need to transform file paths
 * - Need to add/remove fields
 */
function transformItem(item: RegistryItem): RegistryItem {
  return item;
}

// ============================================================================
// Core Sync Logic
// ============================================================================

export async function sync(
  options?: Partial<SyncOptions>
): Promise<SyncResult> {
  const opts: SyncOptions = {
    only: options?.only ?? [],
    dryRun: options?.dryRun ?? false,
  };

  const startTime = Date.now();
  printHeader(`Syncing ${config.displayName}`);
  console.log();

  logInfo(`Source: ${config.source.baseUrl}`);
  if (opts.dryRun) logInfo('Dry run mode - no files will be written');
  console.log();

  // 1. Fetch index
  console.log('📥 Fetching registry index...');
  const items = await fetchRegistryIndex();
  console.log(`   Found ${items.length} components\n`);

  // 2. Filter components
  let filtered = items;
  if (opts.only.length > 0) {
    filtered = items.filter(i => opts.only.includes(i.name));
    logInfo(`Filtering to: ${opts.only.join(', ')}`);
  }
  if (config.sync.include.length > 0) {
    filtered = filtered.filter(i =>
      config.sync.include.includes(i.name)
    );
  }
  if (config.sync.exclude.length > 0) {
    filtered = filtered.filter(
      i => !config.sync.exclude.includes(i.name)
    );
  }

  console.log(`📦 Processing ${filtered.length} components...\n`);

  // 3. Create output directory
  if (!opts.dryRun) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // 4. Download and save each component
  const result: SyncResult = {
    success: [],
    failed: [],
    skipped: [],
    stats: {
      total: items.length,
      synced: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
    },
  };

  for (const item of filtered) {
    process.stdout.write(`   ${item.name}... `);

    if (opts.dryRun) {
      console.log('(dry-run)');
      result.success.push(item.name);
      continue;
    }

    try {
      // Fetch full component detail
      const detail = await fetchComponentDetail(item.name);
      const transformed = transformItem(detail);

      // Validate
      const validation = validateRegistryItem(transformed);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Save JSON file
      const filePath = join(OUTPUT_DIR, `${item.name}.json`);
      await ensureParentDir(filePath);
      await writeFile(
        filePath,
        JSON.stringify(transformed, null, 2),
        'utf-8'
      );

      console.log('✅');
      result.success.push(item.name);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : String(error);
      console.log(`❌ ${errorMsg}`);
      result.failed.push({ name: item.name, error: errorMsg });
    }
  }

  // 5. Generate index files
  if (!opts.dryRun && config.output.generateIndex) {
    const index = {
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      name: config.name,
      homepage: config.meta.homepage,
      syncedAt: getUtcTimestamp(),
      itemCount: result.success.length,
      items: filtered
        .filter(c => result.success.includes(c.name))
        .map(item => ({
          name: item.name,
          type: item.type,
          description: item.description,
          dependencies: item.dependencies,
          registryDependencies: item.registryDependencies,
        })),
    };

    await writeFile(
      join(OUTPUT_DIR, 'index.json'),
      JSON.stringify(index, null, 2),
      'utf-8'
    );
    await writeFile(
      join(OUTPUT_DIR, 'registry.json'),
      JSON.stringify(index, null, 2),
      'utf-8'
    );
    console.log('\n📋 Generated index.json and registry.json');
  }

  // 6. Update stats and print summary
  const duration = Date.now() - startTime;
  result.stats = {
    total: items.length,
    synced: result.success.length,
    failed: result.failed.length,
    skipped: result.skipped.length,
    duration,
  };

  console.log(
    `\n📊 Result: ${result.success.length} success, ${result.failed.length} failed`
  );
  console.log(`   Duration: ${formatDuration(duration)}`);

  return result;
}

// ============================================================================
// Main Entry Point
// ============================================================================

if (import.meta.main) {
  const options = parseArgs();
  sync(options).catch(error => {
    logError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
