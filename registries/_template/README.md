# Template Registry

This is a template for creating new registries.

## Setup

1. Copy this directory:

   ```bash
   cp -r registries/_template registries/my-registry
   ```

2. Update `config.ts`:

   - Set `name` to your registry identifier
   - Set `displayName` to human-readable name
   - Set `description`
   - Set `source.baseUrl` and `source.indexUrl`
   - Set `meta.homepage` and `meta.repository`

3. Customize `scripts/sync.ts` if needed:

   - Override `fetchRegistryIndex()` for custom index format
   - Override `fetchComponentDetail()` for custom URL patterns
   - Override `transformItem()` for data transformation

4. Test sync:

   ```bash
   bun run registries/my-registry/scripts/sync.ts --dry-run
   bun run registries/my-registry/scripts/sync.ts
   ```

5. Verify output:
   ```bash
   bun run registries/my-registry/scripts/verify.ts
   ```

## Directory Structure

```
my-registry/
├── config.ts           # Registry configuration
├── README.md           # Documentation
├── scripts/
│   ├── sync.ts         # Sync script (customizable)
│   └── verify.ts       # Verification script
└── output/             # Generated JSON files
    ├── index.json      # Component index
    ├── registry.json   # shadcn CLI compatible index
    └── *.json          # Individual component files
```

## Common Customizations

### Custom URL Pattern

If the registry uses a different URL structure:

```typescript
// In scripts/sync.ts
async function fetchComponentDetail(
  name: string
): Promise<RegistryItem> {
  // Example: https://example.com/r/{name}.json
  const url = `${config.source.baseUrl}/r/${name}.json`;
  return await fetchWithRetry<RegistryItem>(url);
}
```

### Scraping Instead of API

If no registry.json is available:

```typescript
// In scripts/sync.ts
async function fetchRegistryIndex(): Promise<RegistryItem[]> {
  // Custom logic to scrape component list from website
  // Return array of RegistryItem objects
}
```

### Data Transformation

If source data needs transformation:

```typescript
// In scripts/sync.ts
function transformItem(item: RegistryItem): RegistryItem {
  return {
    ...item,
    // Fix schema if missing
    $schema:
      item.$schema ??
      'https://ui.shadcn.com/schema/registry-item.json',
    // Normalize type
    type: normalizeType(item.type),
  };
}
```
