/**
 * Initialize New Registry
 *
 * Usage: bun run scripts/init-registry.ts <registry-name>
 *        bun run scripts/init-registry.ts my-registry
 */

import { join } from 'node:path';
import { mkdir, writeFile, copyFile, readdir } from 'node:fs/promises';
import {
  printHeader,
  logSuccess,
  logError,
  logInfo,
  pathExists,
  slugify,
} from '../shared';

// ============================================================================
// Configuration
// ============================================================================

const ROOT_DIR = join(import.meta.dir, '..');
const REGISTRIES_DIR = join(ROOT_DIR, 'registries');
const TEMPLATE_DIR = join(REGISTRIES_DIR, '_template');

// ============================================================================
// Argument Parsing
// ============================================================================

function parseArgs(): { name?: string; help: boolean } {
  const args = process.argv.slice(2);
  let name: string | undefined;
  let help = false;

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (!arg.startsWith('-')) {
      name = arg;
    }
  }

  return { name, help };
}

function printUsage(): void {
  console.log(`
Usage: bun run scripts/init-registry.ts <registry-name>

Arguments:
  registry-name    Name for the new registry (will be slugified)

Options:
  --help, -h       Show this help message

Examples:
  bun run scripts/init-registry.ts my-registry
  bun run scripts/init-registry.ts aceternity-ui
`);
}

// ============================================================================
// Template Generation
// ============================================================================

function generateConfigContent(name: string, displayName: string): string {
  return `/**
 * Registry Configuration: ${displayName}
 */

import type { RegistryConfig } from '../../shared/types';

export const config: RegistryConfig = {
  name: '${name}',
  displayName: '${displayName}',
  description: 'TODO: Add description',

  source: {
    baseUrl: 'https://example.com/registry',
    indexUrl: 'https://example.com/registry/registry.json',
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
    homepage: 'https://example.com',
    repository: 'https://github.com/example/repo',
    lastSync: null,
  },
};
`;
}

function generateSyncContent(name: string): string {
  return `/**
 * Sync Script for ${name}
 *
 * Usage:
 *   bun run registries/${name}/scripts/sync.ts
 *   bun run registries/${name}/scripts/sync.ts --only=component1,component2
 *   bun run registries/${name}/scripts/sync.ts --dry-run
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
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
import type { RegistryItem, RegistryIndex, SyncResult } from '../../../shared';

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
      only.push(...arg.slice(7).split(',').map(s => s.trim()));
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
 */
async function fetchRegistryIndex(): Promise<RegistryItem[]> {
  const data = await fetchWithRetry<RegistryIndex>(config.source.indexUrl);
  return data.items as RegistryItem[];
}

/**
 * Fetch single component detail
 * Default: GET {baseUrl}/{name}.json
 */
async function fetchComponentDetail(name: string): Promise<RegistryItem> {
  const url = \`\${config.source.baseUrl}/\${name}.json\`;
  return await fetchWithRetry<RegistryItem>(url);
}

/**
 * Transform/fix component data if needed
 * Default: no transformation
 */
function transformItem(item: RegistryItem): RegistryItem {
  return item;
}

// ============================================================================
// Core Sync Logic
// ============================================================================

export async function sync(options?: Partial<SyncOptions>): Promise<SyncResult> {
  const opts: SyncOptions = {
    only: options?.only ?? [],
    dryRun: options?.dryRun ?? false,
  };

  const startTime = Date.now();
  printHeader(\`Syncing \${config.displayName}\`);
  console.log();

  logInfo(\`Source: \${config.source.baseUrl}\`);
  if (opts.dryRun) logInfo('Dry run mode - no files will be written');
  console.log();

  // 1. Fetch index
  console.log('📥 Fetching registry index...');
  const items = await fetchRegistryIndex();
  console.log(\`   Found \${items.length} components\\n\`);

  // 2. Filter components
  let filtered = items;
  if (opts.only.length > 0) {
    filtered = items.filter(i => opts.only.includes(i.name));
    logInfo(\`Filtering to: \${opts.only.join(', ')}\`);
  }
  if (config.sync.include.length > 0) {
    filtered = filtered.filter(i => config.sync.include.includes(i.name));
  }
  if (config.sync.exclude.length > 0) {
    filtered = filtered.filter(i => !config.sync.exclude.includes(i.name));
  }

  console.log(\`📦 Processing \${filtered.length} components...\\n\`);

  // 3. Create output directory
  if (!opts.dryRun) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // 4. Download and save each component
  const result: SyncResult = {
    success: [],
    failed: [],
    skipped: [],
    stats: { total: items.length, synced: 0, failed: 0, skipped: 0, duration: 0 },
  };

  for (const item of filtered) {
    process.stdout.write(\`   \${item.name}... \`);

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
      const filePath = join(OUTPUT_DIR, \`\${item.name}.json\`);
      await ensureParentDir(filePath);
      await writeFile(filePath, JSON.stringify(transformed, null, 2), 'utf-8');

      console.log('✅');
      result.success.push(item.name);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(\`❌ \${errorMsg}\`);
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

    await writeFile(join(OUTPUT_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf-8');
    await writeFile(join(OUTPUT_DIR, 'registry.json'), JSON.stringify(index, null, 2), 'utf-8');
    console.log('\\n📋 Generated index.json and registry.json');
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

  console.log(\`\\n📊 Result: \${result.success.length} success, \${result.failed.length} failed\`);
  console.log(\`   Duration: \${formatDuration(duration)}\`);

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
`;
}

function generateVerifyContent(name: string): string {
  return `/**
 * Verify Script for ${name}
 *
 * Usage: bun run registries/${name}/scripts/verify.ts
 */

import { join } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import {
  validateRegistryItem,
  logSuccess,
  logError,
  logWarning,
  printHeader,
  pathExists,
} from '../../../shared';
import type { VerifyResult } from '../../../shared';

// ============================================================================
// Configuration
// ============================================================================

const OUTPUT_DIR = join(import.meta.dir, '..', 'output');

// ============================================================================
// Main Function
// ============================================================================

async function main(): Promise<void> {
  printHeader('Verify ${name}');
  console.log();

  if (!(await pathExists(OUTPUT_DIR))) {
    logWarning('Output directory not found. Run sync first.');
    process.exit(0);
  }

  const files = await readdir(OUTPUT_DIR);
  const jsonFiles = files.filter(
    f => f.endsWith('.json') && f !== 'index.json' && f !== 'registry.json'
  );

  if (jsonFiles.length === 0) {
    logWarning('No component files found');
    process.exit(0);
  }

  const result: VerifyResult = { valid: [], invalid: [] };

  for (const file of jsonFiles) {
    const filePath = join(OUTPUT_DIR, file);

    try {
      const content = await readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      const validation = validateRegistryItem(data);

      if (validation.valid) {
        result.valid.push(file);
        if (validation.warnings) {
          validation.warnings.forEach(w => logWarning(\`\${file}: \${w}\`));
        }
      } else {
        result.invalid.push({ file, error: validation.error ?? 'Unknown error' });
      }
    } catch (error) {
      result.invalid.push({
        file,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Print results
  console.log(\`\\n📊 Result: \${result.valid.length} valid, \${result.invalid.length} invalid\`);

  if (result.invalid.length > 0) {
    console.log('\\n❌ Invalid files:');
    result.invalid.forEach(({ file, error }) => {
      console.log(\`   - \${file}: \${error}\`);
    });
    process.exit(1);
  }

  logSuccess('All files are valid!');
}

main().catch(error => {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
`;
}

function generateReadmeContent(name: string, displayName: string): string {
  return `# ${displayName}

## Source

- Homepage: TODO
- Registry: TODO

## Usage

Add to your \`components.json\`:

\`\`\`json
{
  "registries": {
    "@${name}": "https://raw.githubusercontent.com/{owner}/shadcn-registries/main/registries/${name}/output/{name}.json"
  }
}
\`\`\`

## Commands

\`\`\`bash
# Sync this registry
bun run registries/${name}/scripts/sync.ts

# Verify output
bun run registries/${name}/scripts/verify.ts
\`\`\`

## Components

| Component | Description |
|-----------|-------------|
| TODO | TODO |
`;
}

// ============================================================================
// Main Function
// ============================================================================

async function main(): Promise<void> {
  const { name, help } = parseArgs();

  if (help) {
    printUsage();
    process.exit(0);
  }

  printHeader('Initialize New Registry');
  console.log();

  if (!name) {
    logError('Registry name is required');
    printUsage();
    process.exit(1);
  }

  // Slugify the name
  const slugName = slugify(name);
  const displayName = name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  logInfo(`Creating registry: ${slugName}`);
  logInfo(`Display name: ${displayName}`);
  console.log();

  const registryDir = join(REGISTRIES_DIR, slugName);
  const scriptsDir = join(registryDir, 'scripts');
  const outputDir = join(registryDir, 'output');

  // Check if already exists
  if (await pathExists(registryDir)) {
    logError(`Registry already exists: ${registryDir}`);
    process.exit(1);
  }

  // Create directories
  await mkdir(scriptsDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });

  // Create .gitkeep in output
  await writeFile(join(outputDir, '.gitkeep'), '');

  // Create config.ts
  await writeFile(
    join(registryDir, 'config.ts'),
    generateConfigContent(slugName, displayName)
  );
  console.log('   ✅ config.ts');

  // Create scripts/sync.ts
  await writeFile(
    join(scriptsDir, 'sync.ts'),
    generateSyncContent(slugName)
  );
  console.log('   ✅ scripts/sync.ts');

  // Create scripts/verify.ts
  await writeFile(
    join(scriptsDir, 'verify.ts'),
    generateVerifyContent(slugName)
  );
  console.log('   ✅ scripts/verify.ts');

  // Create README.md
  await writeFile(
    join(registryDir, 'README.md'),
    generateReadmeContent(slugName, displayName)
  );
  console.log('   ✅ README.md');

  console.log();
  logSuccess(`Registry initialized: ${registryDir}`);
  console.log(`
Next steps:
  1. Edit config.ts with the source registry URL
  2. Customize scripts/sync.ts if needed
  3. Run: bun run registries/${slugName}/scripts/sync.ts
`);
}

main().catch(error => {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
