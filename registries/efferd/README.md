# Efferd

Auth, contact, CTA, and other UI blocks.

## Source

- **Homepage**: https://efferd.com
- **Registry URL**: https://efferd.com/r

## Usage

Add to your `components.json`:

```json
{
  "registries": {
    "@efferd": "https://raw.githubusercontent.com/030201xz/shadcn-registries/main/registries/efferd/output/{name}.json"
  }
}
```

Install components:

```bash
npx shadcn@latest add @efferd/auth-1
npx shadcn@latest add @efferd/contact-1
npx shadcn@latest add @efferd/cta-1
```

## Components

- `auth-*` - Authentication pages
- `contact-*` - Contact sections
- `cta-*` - Call to action sections
- And more...

## Note

Some items in the registry index don't have individual JSON endpoints (e.g., `index`). These are automatically skipped during sync.

## Sync

```bash
bun run registries/efferd/scripts/sync.ts
```
