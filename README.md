# Shadcn Registries

Aggregated Shadcn UI Component Registries - Mirror and host multiple third-party component registries.

## Usage

Add to your `components.json`:

```json
{
  "registries": {
    "@assistant-ui-x": "https://raw.githubusercontent.com/{owner}/shadcn-registries/main/registries/assistant-ui/output/{name}.json"
  }
}
```

Install components:

```bash
npx shadcn@latest add @assistant-ui-x/thread
```

## Available Registries

| Registry       | Source                                         | Description              |
| -------------- | ---------------------------------------------- | ------------------------ |
| `assistant-ui` | [assistant-ui.com](https://assistant-ui.com)   | AI Chat UI Library       |
| `aceternity`   | [ui.aceternity.com](https://ui.aceternity.com) | Aceternity UI Components |

## Commands

```bash
# Sync all registries
bun run sync

# Sync specific registry
bun run sync:registry assistant-ui

# Verify all registries
bun run verify

# Initialize new registry
bun run init my-registry
```

## Project Structure

```
shadcn-registries/
├── shared/                  # Shared utilities
│   ├── types.ts            # Type definitions
│   ├── fetch.ts            # HTTP utilities
│   ├── validate.ts         # Validation utilities
│   └── utils.ts            # General utilities
├── scripts/                 # Global scripts
│   ├── sync-all.ts         # Sync all registries
│   ├── sync-registry.ts    # Sync single registry
│   ├── verify-all.ts       # Verify all registries
│   └── init-registry.ts    # Initialize new registry
├── registries/              # Registry storage
│   ├── assistant-ui/       # Each registry has its own directory
│   │   ├── config.ts       # Registry configuration
│   │   ├── scripts/        # Custom sync/verify scripts
│   │   ├── output/         # Generated JSON files
│   │   └── README.md       # Registry documentation
│   └── _template/          # Template for new registries
└── .github/workflows/       # GitHub Actions
```

## Adding a New Registry

1. Initialize template:

   ```bash
   bun run init my-registry
   ```

2. Edit configuration:

   ```
   registries/my-registry/config.ts
   ```

3. Customize sync script if needed:

   ```
   registries/my-registry/scripts/sync.ts
   ```

4. Test sync:
   ```bash
   bun run sync:registry my-registry
   ```

## License

MIT
