/**
 * Verify All Registries
 *
 * Usage: bun run scripts/verify-all.ts
 */

import { join } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import {
  getRegistryNames,
  printHeader,
  printSeparator,
  logSuccess,
  logError,
  logWarning,
  logInfo,
  pathExists,
  validateRegistryItem,
} from '../shared';
import type { VerifyResult } from '../shared';

// ============================================================================
// Configuration
// ============================================================================

const ROOT_DIR = join(import.meta.dir, '..');
const REGISTRIES_DIR = join(ROOT_DIR, 'registries');

// ============================================================================
// Verification Functions
// ============================================================================

async function verifyRegistryOutput(
  registryDir: string
): Promise<VerifyResult> {
  const result: VerifyResult = { valid: [], invalid: [] };
  const outputDir = join(registryDir, 'output');

  if (!(await pathExists(outputDir))) {
    return result;
  }

  const files = await readdir(outputDir);
  const jsonFiles = files.filter(
    f =>
      f.endsWith('.json') &&
      f !== 'index.json' &&
      f !== 'registry.json'
  );

  for (const file of jsonFiles) {
    const filePath = join(outputDir, file);

    try {
      const content = await readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      const validation = validateRegistryItem(data);

      if (validation.valid) {
        result.valid.push(file);
        if (validation.warnings) {
          validation.warnings.forEach(w =>
            logWarning(`${file}: ${w}`)
          );
        }
      } else {
        result.invalid.push({
          file,
          error: validation.error ?? 'Unknown error',
        });
      }
    } catch (error) {
      result.invalid.push({
        file,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return result;
}

// ============================================================================
// Main Function
// ============================================================================

async function main(): Promise<void> {
  printHeader('Shadcn Registries - Verify All');
  console.log();

  const registryNames = await getRegistryNames(REGISTRIES_DIR);

  if (registryNames.length === 0) {
    logWarning('No registries found');
    process.exit(0);
  }

  logInfo(`Found ${registryNames.length} registries\n`);

  let totalValid = 0;
  let totalInvalid = 0;
  const allInvalid: {
    registry: string;
    file: string;
    error: string;
  }[] = [];

  for (const name of registryNames) {
    console.log(`\n📦 Verifying ${name}...`);

    const registryDir = join(REGISTRIES_DIR, name);
    const result = await verifyRegistryOutput(registryDir);

    totalValid += result.valid.length;
    totalInvalid += result.invalid.length;

    if (result.valid.length === 0 && result.invalid.length === 0) {
      logWarning(`${name}: No output files found`);
    } else if (result.invalid.length === 0) {
      logSuccess(`${name}: ${result.valid.length} valid files`);
    } else {
      logError(
        `${name}: ${result.valid.length} valid, ${result.invalid.length} invalid`
      );
      result.invalid.forEach(({ file, error }) => {
        console.log(`   ❌ ${file}: ${error}`);
        allInvalid.push({ registry: name, file, error });
      });
    }
  }

  // Print summary
  console.log();
  printSeparator();
  console.log('\n📊 Summary:');
  console.log(`   Total Valid: ${totalValid}`);
  console.log(`   Total Invalid: ${totalInvalid}`);

  if (allInvalid.length > 0) {
    console.log('\n❌ Invalid files:');
    allInvalid.forEach(({ registry, file, error }) => {
      console.log(`   - ${registry}/${file}: ${error}`);
    });
    process.exit(1);
  }

  console.log();
  logSuccess('All registries verified successfully!');
}

main().catch(error => {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
