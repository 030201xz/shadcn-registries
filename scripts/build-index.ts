/**
 * Build Global Index
 *
 * Generates a combined index of all registries
 *
 * Usage: bun run scripts/build-index.ts
 */

import { join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import {
  getRegistryNames,
  printHeader,
  logSuccess,
  logError,
  logInfo,
  pathExists,
  getUtcTimestamp,
} from '../shared';

// ============================================================================
// Configuration
// ============================================================================

const ROOT_DIR = join(import.meta.dir, '..');
const REGISTRIES_DIR = join(ROOT_DIR, 'registries');

// ============================================================================
// Types
// ============================================================================

interface GlobalIndex {
  $schema: string;
  generatedAt: string;
  registries: RegistryInfo[];
}

interface RegistryInfo {
  name: string;
  displayName: string;
  description: string;
  homepage: string;
  itemCount: number;
  lastSync: string | null;
  url: string;
}

// ============================================================================
// Main Function
// ============================================================================

async function main(): Promise<void> {
  printHeader('Build Global Index');
  console.log();

  const registryNames = await getRegistryNames(REGISTRIES_DIR);
  logInfo(`Found ${registryNames.length} registries\n`);

  const registries: RegistryInfo[] = [];

  for (const name of registryNames) {
    const registryDir = join(REGISTRIES_DIR, name);
    const indexPath = join(registryDir, 'output', 'index.json');

    // Load config
    try {
      const configModule = await import(
        join(registryDir, 'config.ts')
      );
      const config = configModule.config;

      let itemCount = 0;
      let lastSync: string | null = null;

      // Try to read index.json for item count
      if (await pathExists(indexPath)) {
        const indexContent = await readFile(indexPath, 'utf-8');
        const index = JSON.parse(indexContent);
        itemCount = index.itemCount ?? 0;
        lastSync = index.syncedAt ?? null;
      }

      registries.push({
        name: config.name,
        displayName: config.displayName,
        description: config.description,
        homepage: config.meta.homepage,
        itemCount,
        lastSync,
        url: `registries/${name}/output/{name}.json`,
      });

      console.log(`   ✅ ${name}: ${itemCount} components`);
    } catch (error) {
      logError(`Failed to load ${name}: ${error}`);
    }
  }

  // Generate global index
  const globalIndex: GlobalIndex = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    generatedAt: getUtcTimestamp(),
    registries,
  };

  // Write to root directory
  const outputPath = join(ROOT_DIR, 'index.json');
  await writeFile(
    outputPath,
    JSON.stringify(globalIndex, null, 2),
    'utf-8'
  );

  console.log();
  logSuccess(`Global index generated: index.json`);
  console.log(`   Total registries: ${registries.length}`);
  console.log(
    `   Total components: ${registries.reduce(
      (sum, r) => sum + r.itemCount,
      0
    )}`
  );
}

main().catch(error => {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
