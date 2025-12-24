# AI Elements

AI-powered UI components from Vercel AI SDK for building AI applications.

## Source

- **Homepage**: https://registry.ai-sdk.dev/elements
- **Registry URL**: https://registry.ai-sdk.dev

## Usage

Add to your `components.json`:

```json
{
  "registries": {
    "@ai-elements": "https://raw.githubusercontent.com/030201xz/shadcn-registries/main/registries/ai-elements/output/{name}.json"
  }
}
```

Install components:

```bash
npx shadcn@latest add @ai-elements/artifact
npx shadcn@latest add @ai-elements/canvas
npx shadcn@latest add @ai-elements/code-block
```

## Components

Components for building AI-powered applications including:

- `artifact` - AI-powered artifact component
- `canvas` - AI-powered canvas component
- `chain-of-thought` - Chain of thought visualization
- `code-block` - Code block with syntax highlighting
- `confirmation` - Confirmation dialogs
- And more...

## Sync

```bash
bun run registries/ai-elements/scripts/sync.ts
```
