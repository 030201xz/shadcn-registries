/**
 * Sync Script for Limeplay
 *
 * From `https://limeplay.winoffrg.dev/r` Get all components and save them locally
 * Responsibility: Purely download, keep the source data as is
 *
 * Note: The source registry has duplicate 'index' items.
 * This script deduplicates items by name before processing.
 *
 * Usage:
 *   bun run registries/limeplay/scripts/sync.ts
 *   bun run registries/limeplay/scripts/sync.ts --only=media-provider,mute-control
 *   bun run registries/limeplay/scripts/sync.ts --dry-run
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { config } from '../config';

// ============================================================================
// Types
// ============================================================================

interface RegistryFile {
  path: string;
  content: string;
  type: string;
  target?: string;
}

interface RegistryItem {
  $schema?: string;
  name: string;
  type: string;
  title?: string;
  author?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
  cssVars?: {
    theme?: Record<string, string>;
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
  categories?: string[];
  meta?: Record<string, unknown>;
}

interface RegistryIndexItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files?: Array<{ path: string; type: string; target?: string }>;
  cssVars?: Record<string, unknown>;
}

interface RegistryIndex {
  homepage: string;
  items: RegistryIndexItem[];
}

// ============================================================================
// Configuration
// ============================================================================

const OUTPUT_DIR = join(import.meta.dir, '..', 'output');
const RETRY_COUNT = 3;
const RETRY_DELAY = 1000;
const CONCURRENCY = 5;

// ============================================================================
// Utilities
// ============================================================================

function parseArgs(): { only: string[] | null; dryRun: boolean } {
  const args = process.argv.slice(2);
  let only: string[] | null = null;
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith('--only=')) {
      only = arg
        .slice(7)
        .split(',')
        .map(s => s.trim());
    }
    if (arg === '--dry-run') {
      dryRun = true;
    }
  }

  return { only, dryRun };
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  url: string,
  retries = RETRY_COUNT
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      lastError = error as Error;
      if (i < retries) {
        console.log(`  ⏳ Retry ${i + 1}/${retries}: ${url}`);
        await sleep(RETRY_DELAY * (i + 1));
      }
    }
  }

  throw lastError;
}

async function ensureDir(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  await mkdir(dir, { recursive: true });
}

/**
 * Deduplicate items by name, keeping the first occurrence
 */
function deduplicateItems(
  items: RegistryIndexItem[]
): RegistryIndexItem[] {
  const seen = new Set<string>();
  const result: RegistryIndexItem[] = [];

  for (const item of items) {
    if (!seen.has(item.name)) {
      seen.add(item.name);
      result.push(item);
    }
  }

  return result;
}

// ============================================================================
// Core Logic
// ============================================================================

async function fetchRegistryIndex(): Promise<RegistryIndex> {
  console.log('📥 Fetching registry index...');
  const index = await fetchWithRetry<RegistryIndex>(
    config.source.indexUrl
  );

  // Deduplicate items
  const originalCount = index.items.length;
  index.items = deduplicateItems(index.items);
  const deduplicatedCount = originalCount - index.items.length;

  console.log(`   Found ${originalCount} items`);
  if (deduplicatedCount > 0) {
    console.log(`   Deduplicated ${deduplicatedCount} duplicate items`);
  }
  console.log(`   Processing ${index.items.length} unique components\n`);

  return index;
}

async function fetchComponent(
  name: string
): Promise<RegistryItem | null> {
  const url = `${config.source.baseUrl}/${name}.json`;
  try {
    const item = await fetchWithRetry<RegistryItem>(url);
    return item;
  } catch (error) {
    // Don't log retry failures for expected 404s
    return null;
  }
}

async function downloadComponents(
  items: RegistryIndexItem[],
  filter: string[] | null
): Promise<RegistryItem[]> {
  // Apply filters
  let filteredItems = filter
    ? items.filter(item => filter.includes(item.name))
    : items;

  // Apply exclude list from config
  if (config.sync.exclude.length > 0) {
    filteredItems = filteredItems.filter(
      item => !config.sync.exclude.includes(item.name)
    );
  }

  console.log(
    `📦 Downloading ${filteredItems.length} components...\n`
  );

  const results: RegistryItem[] = [];
  const failed: string[] = [];
  const queue = [...filteredItems];
  let completed = 0;

  async function processQueue(): Promise<void> {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const component = await fetchComponent(item.name);
      if (component) {
        results.push(component);
      } else {
        failed.push(item.name);
      }

      completed++;
      const progress = Math.round(
        (completed / filteredItems.length) * 100
      );
      process.stdout.write(
        `\r   Progress: ${completed}/${filteredItems.length} (${progress}%)`
      );
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, filteredItems.length) },
    () => processQueue()
  );
  await Promise.all(workers);

  console.log('\n');

  if (failed.length > 0) {
    console.log(
      `⚠️  Skipped ${failed.length} items (no JSON endpoint): ${failed.join(', ')}\n`
    );
  }

  return results;
}

async function saveComponent(
  item: RegistryItem,
  dryRun: boolean
): Promise<void> {
  const filePath = join(OUTPUT_DIR, `${item.name}.json`);

  if (dryRun) {
    console.log(`   ${item.name}.json (dry-run)`);
    return;
  }

  await ensureDir(filePath);
  await writeFile(filePath, JSON.stringify(item, null, 2), 'utf-8');
  console.log(`   ${item.name}.json ✅`);
}

async function saveRegistryIndex(
  items: RegistryItem[],
  dryRun: boolean
): Promise<void> {
  const indexPath = join(OUTPUT_DIR, 'index.json');
  const registryPath = join(OUTPUT_DIR, 'registry.json');

  const index = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: config.name,
    homepage: config.meta.homepage,
    syncedAt: new Date().toISOString(),
    itemCount: items.length,
    items: items.map(item => ({
      name: item.name,
      type: item.type,
      title: item.title,
      author: item.author,
      description: item.description,
      categories: item.categories,
      dependencies: item.dependencies,
      registryDependencies: item.registryDependencies,
    })),
  };

  if (dryRun) {
    console.log(`\n📋 index.json (dry-run)`);
    console.log(`📋 registry.json (dry-run)`);
    return;
  }

  await ensureDir(indexPath);
  await writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  await writeFile(
    registryPath,
    JSON.stringify(index, null, 2),
    'utf-8'
  );
  console.log(`\n📋 Generated index.json and registry.json`);
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const startTime = Date.now();
  const { only, dryRun } = parseArgs();

  console.log(
    '═════════════════════════════════════════════════════════════════'
  );
  console.log(`   Syncing ${config.displayName}`);
  console.log(
    '═════════════════════════════════════════════════════════════════\n'
  );

  console.log(`ℹ️  Source: ${config.source.baseUrl}`);
  if (dryRun)
    console.log('ℹ️  Dry run mode - no files will be written');
  if (only) console.log(`ℹ️  Filtering to: ${only.join(', ')}`);
  if (config.sync.exclude.length > 0) {
    console.log(`ℹ️  Excluding: ${config.sync.exclude.join(', ')}`);
  }
  console.log();

  try {
    // 1. Fetch index
    const index = await fetchRegistryIndex();

    // 2. Download components
    const components = await downloadComponents(index.items, only);

    if (components.length === 0) {
      console.log('⚠️  No components found');
      return;
    }

    // 3. Save components
    console.log('💾 Saving files...\n');
    for (const component of components) {
      await saveComponent(component, dryRun);
    }

    // 4. Save index
    await saveRegistryIndex(components, dryRun);

    // 5. Summary
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(
      '\n═════════════════════════════════════════════════════════════════'
    );
    console.log(`   ✅ Sync complete`);
    console.log(`   📦 Components: ${components.length}`);
    console.log(`   ⏱️  Duration: ${elapsed}s`);
    console.log(
      '═════════════════════════════════════════════════════════════════\n'
    );
  } catch (error) {
    console.error('\n❌ Sync failed:', (error as Error).message);
    process.exit(1);
  }
}

main();
