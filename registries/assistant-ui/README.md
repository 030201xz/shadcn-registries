# Assistant UI

AI Chat UI Library - React components for building AI chat interfaces.

## Source

- Homepage: https://assistant-ui.com
- Registry: https://r.assistant-ui.com
- Repository: https://github.com/assistant-ui/assistant-ui

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
npx shadcn@latest add @assistant-ui-x/attachment
```

## Commands

```bash
# Sync this registry
bun run registries/assistant-ui/scripts/sync.ts

# Sync specific components only
bun run registries/assistant-ui/scripts/sync.ts --only=thread,attachment

# Dry run (preview)
bun run registries/assistant-ui/scripts/sync.ts --dry-run

# Verify output
bun run registries/assistant-ui/scripts/verify.ts
```

## Components

| Component             | Type      | Description                 |
| --------------------- | --------- | --------------------------- |
| thread                | component | Main chat thread component  |
| thread-list           | component | List of chat threads        |
| attachment            | component | File attachment component   |
| markdown-text         | component | Markdown text renderer      |
| reasoning             | component | AI reasoning display        |
| tooltip-icon-button   | component | Icon button with tooltip    |
| tool-fallback         | component | Fallback for unknown tools  |
| ai-sdk-backend        | page      | AI SDK backend setup        |
| shiki-highlighter     | component | Syntax highlighter          |
| syntax-highlighter    | component | Code syntax highlighting    |
| mermaid-diagram       | component | Mermaid diagram renderer    |
| follow-up-suggestions | component | Suggested follow-up prompts |
| shimmer-style         | style     | Loading shimmer animation   |
| assistant-modal       | component | Modal chat interface        |
| assistant-sidebar     | component | Sidebar chat interface      |
| threadlist-sidebar    | component | Thread list in sidebar      |

## License

Components are from [assistant-ui](https://github.com/assistant-ui/assistant-ui) and follow their license terms.
