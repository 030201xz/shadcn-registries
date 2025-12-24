# Limeplay

Media player UI components for React applications.

## Source

- **Homepage**: https://limeplay.winoffrg.dev
- **Registry URL**: https://limeplay.winoffrg.dev/r

## Usage

Add to your `components.json`:

```json
{
  "registries": {
    "@limeplay": "https://raw.githubusercontent.com/030201xz/shadcn-registries/main/registries/limeplay/output/{name}.json"
  }
}
```

Install components:

```bash
npx shadcn@latest add @limeplay/media-provider
npx shadcn@latest add @limeplay/mute-control
npx shadcn@latest add @limeplay/fallback-poster
```

## Components

- `media-provider` - Media player context provider
- `mute-control` - Mute/unmute control
- `fallback-poster` - Fallback poster image
- `use-volume` - Volume control hook
- `use-player` - Player control hook
- And more...

## Note

The source registry has duplicate 'index' items which are automatically deduplicated during sync.

## Sync

```bash
bun run registries/limeplay/scripts/sync.ts
```
