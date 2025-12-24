# Blocks

Ready-to-use UI blocks for rapid development.

## Source

- **Homepage**: https://blocks.so
- **Registry URL**: https://blocks.so/r

## Usage

Add to your `components.json`:

```json
{
  "registries": {
    "@blocks": "https://raw.githubusercontent.com/030201xz/shadcn-registries/main/registries/blocks/output/{name}.json"
  }
}
```

Install components:

```bash
npx shadcn@latest add @blocks/ai-01
npx shadcn@latest add @blocks/hero-01
npx shadcn@latest add @blocks/pricing-01
```

## Components

Various UI blocks including:

- `ai-*` - AI chat components
- `hero-*` - Hero sections
- `pricing-*` - Pricing components
- `testimonial-*` - Testimonial sections
- And more...

## Sync

```bash
bun run registries/blocks/scripts/sync.ts
```
