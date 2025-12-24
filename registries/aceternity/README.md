# Aceternity UI Registry

Beautiful, animated UI components with stunning visual effects for React.

## Source

- **Homepage**: https://ui.aceternity.com
- **Registry URL**: https://ui.aceternity.com/registry

## Usage

Add to your `components.json`:

```json
{
  "registries": {
    "@aceternity": "https://raw.githubusercontent.com/030201xz/shadcn-registries/main/registries/aceternity/output/{name}.json"
  }
}
```

Then install components:

```bash
npx shadcn@latest add @aceternity/3d-card
npx shadcn@latest add @aceternity/bento-grid
npx shadcn@latest add @aceternity/floating-dock
```

## Sync

```bash
# Sync all components
bun run registries/aceternity/scripts/sync.ts

# Sync specific components
bun run registries/aceternity/scripts/sync.ts --only=3d-card,bento-grid

# Dry run (no file writes)
bun run registries/aceternity/scripts/sync.ts --dry-run
```

## Features

- **Dynamic Sync**: Components fetched directly from source registry.json
- **Enriched Metadata**: Adds descriptions and categories for better MCP search
- **Full Field Support**: Preserves title, author, dependencies from source
- **Schema Validation**: Validates all items against shadcn registry schema

## Component Categories

| Category         | Examples                                             |
| ---------------- | ---------------------------------------------------- |
| **3D Effects**   | 3d-card, 3d-marquee, globe                           |
| **Backgrounds**  | aurora-background, wavy-background, stars-background |
| **Cards**        | card-hover-effect, wobble-card, glare-card           |
| **Text Effects** | typewriter-effect, text-generate-effect, flip-words  |
| **Navigation**   | floating-dock, floating-navbar, sidebar              |
| **Animations**   | animated-modal, animated-testimonials, sparkles      |
