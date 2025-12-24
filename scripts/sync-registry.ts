/**
 * Sync Single Registry
 *
 * Usage: bun run scripts/sync-registry.ts <registry-name>
 *        bun run scripts/sync-registry.ts assistant-ui
 *        bun run scripts/sync-registry.ts assistant-ui --dry-run
 *        bun run scripts/sync-registry.ts assistant-ui --only=thread,attachment
 */

import { join } from 'node:path';
import {
  getRegistryNames,
  printHeader,
  logSuccess,
  logError,
  logInfo,
  pathExists,
} from '../shared';

// ============================================================================
// Configuration
// ============================================================================

const ROOT_DIR = join(import.meta.dir, '..');
const REGISTRIES_DIR = join(ROOT_DIR, 'registries');

// ============================================================================
// Argument Parsing
// ============================================================================

function parseArgs(): {
  registry?: string;
  dryRun: boolean;
  only: string[];
  help: boolean;
} {
  const args = process.argv.slice(2);
  let registry: string | undefined;
  let dryRun = false;
  const only: string[] = [];
  let help = false;

  for (const arg of args) {
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (arg.startsWith('--only=')) {
      only.push(...arg.slice(7).split(',').map(s => s.trim()));
    } else if (!arg.startsWith('-')) {
      registry = arg;
    }
  }

  return { registry, dryRun, only, help };
}

function printUsage(): void {
  console.log(`
Usage: bun run scripts/sync-registry.ts <registry-name> [options]

Arguments:
  registry-name    Name of the registry to sync

Options:
  --dry-run        Preview what would be synced without writing files
  --only=a,b,c     Only sync specified components
  --help, -h       Show this help message

Examples:
  bun run scripts/sync-registry.ts assistant-ui
  bun run scripts/sync-registry.ts assistant-ui --dry-run
  bun run scripts/sync-registry.ts assistant-ui --only=thread,attachment
`);
}

// ============================================================================
// Main Function
// ============================================================================

async function main(): Promise<void> {
  const { registry, dryRun, only, help } = parseArgs();

  if (help) {
    printUsage();
    process.exit(0);
  }

  printHeader('Shadcn Registries - Sync Registry');
  console.log();

  // Get available registries
  const availableRegistries = await getRegistryNames(REGISTRIES_DIR);

  // Check if registry is provided
  if (!registry) {
    logError('Registry name is required');
    console.log(`\nAvailable registries: ${availableRegistries.join(', ')}`);
    console.log('\nUsage: bun run scripts/sync-registry.ts <registry-name>');
    process.exit(1);
  }

  // Check if registry exists
  if (!availableRegistries.includes(registry)) {
    logError(`Registry not found: ${registry}`);
    console.log(`\nAvailable registries: ${availableRegistries.join(', ')}`);
    process.exit(1);
  }

  // Check if sync script exists
  const syncPath = join(REGISTRIES_DIR, registry, 'scripts', 'sync.ts');
  if (!(await pathExists(syncPath))) {
    logError(`Sync script not found: ${syncPath}`);
    process.exit(1);
  }

  logInfo(`Syncing registry: ${registry}`);
  if (dryRun) logInfo('Dry run mode');
  if (only.length > 0) logInfo(`Only: ${only.join(', ')}`);
  console.log();

  // Build arguments for sync script
  const syncArgs = ['bun', 'run', syncPath];
  if (dryRun) syncArgs.push('--dry-run');
  if (only.length > 0) syncArgs.push(`--only=${only.join(',')}`);

  // Run sync script
  const proc = Bun.spawn(syncArgs, {
    cwd: ROOT_DIR,
    stdout: 'inherit',
    stderr: 'inherit',
  });

  const exitCode = await proc.exited;

  if (exitCode === 0) {
    logSuccess(`Registry ${registry} synced successfully`);
  } else {
    logError(`Registry ${registry} sync failed with exit code ${exitCode}`);
    process.exit(exitCode);
  }
}

main().catch(error => {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
