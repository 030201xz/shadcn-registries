/**
 * Sync All Registries
 *
 * Usage: bun run scripts/sync-all.ts
 *        bun run scripts/sync-all.ts --dry-run
 */

import { join } from 'node:path';
import {
  getRegistryNames,
  printHeader,
  printSeparator,
  logSuccess,
  logError,
  logInfo,
  formatDuration,
  getUtcTimestamp,
} from '../shared';

// ============================================================================
// Configuration
// ============================================================================

const ROOT_DIR = join(import.meta.dir, '..');
const REGISTRIES_DIR = join(ROOT_DIR, 'registries');

// ============================================================================
// Main Function
// ============================================================================

async function main(): Promise<void> {
  const startTime = Date.now();
  const isDryRun = process.argv.includes('--dry-run');

  printHeader('Shadcn Registries - Sync All');
  console.log();

  if (isDryRun) {
    logInfo('Dry run mode - no files will be written\n');
  }

  // Get all registry names
  const registryNames = await getRegistryNames(REGISTRIES_DIR);

  if (registryNames.length === 0) {
    logError('No registries found');
    process.exit(1);
  }

  logInfo(`Found ${registryNames.length} registries: ${registryNames.join(', ')}\n`);

  // Track results
  const results: { name: string; success: boolean; error?: string }[] = [];

  // Sync each registry
  for (const name of registryNames) {
    console.log(`\n📦 Syncing ${name}...`);

    try {
      // Import and run the registry's sync script
      const syncPath = join(REGISTRIES_DIR, name, 'scripts', 'sync.ts');
      const syncModule = await import(syncPath);

      // Run the sync function if exported
      if (typeof syncModule.sync === 'function') {
        await syncModule.sync({ dryRun: isDryRun });
        logSuccess(`${name} synced successfully`);
        results.push({ name, success: true });
      } else {
        // Otherwise run the script directly via subprocess
        const proc = Bun.spawn(['bun', 'run', syncPath, ...(isDryRun ? ['--dry-run'] : [])], {
          cwd: ROOT_DIR,
          stdout: 'inherit',
          stderr: 'inherit',
        });

        const exitCode = await proc.exited;

        if (exitCode === 0) {
          logSuccess(`${name} synced successfully`);
          results.push({ name, success: true });
        } else {
          throw new Error(`Exit code: ${exitCode}`);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logError(`Failed to sync ${name}: ${errorMsg}`);
      results.push({ name, success: false, error: errorMsg });
    }
  }

  // Print summary
  const duration = Date.now() - startTime;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log();
  printSeparator();
  console.log('\n📊 Summary:');
  console.log(`   Total: ${results.length}`);
  console.log(`   Successful: ${successful}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Duration: ${formatDuration(duration)}`);
  console.log(`   Timestamp: ${getUtcTimestamp()}`);

  if (failed > 0) {
    console.log('\n❌ Failed registries:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    process.exit(1);
  }

  console.log();
  logSuccess('All registries synced successfully!');
}

main().catch(error => {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
