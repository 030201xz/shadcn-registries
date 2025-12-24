/**
 * Verify Script for assistant-ui
 *
 * Usage: bun run registries/assistant-ui/scripts/verify.ts
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
  printHeader('Verify assistant-ui');
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

  console.log(`📂 Checking ${jsonFiles.length} component files...\n`);

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
          validation.warnings.forEach(w => logWarning(`${file}: ${w}`));
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
  console.log(`\n📊 Result: ${result.valid.length} valid, ${result.invalid.length} invalid`);

  if (result.invalid.length > 0) {
    console.log('\n❌ Invalid files:');
    result.invalid.forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`);
    });
    process.exit(1);
  }

  logSuccess('All files are valid!');
}

main().catch(error => {
  logError(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
