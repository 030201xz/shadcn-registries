# Better Upload

Beautiful file upload components for React applications.

## Source

- **Homepage**: https://better-upload.com
- **Registry URL**: https://better-upload.com/r

## Usage

Add to your `components.json`:

```json
{
  "registries": {
    "@better-upload": "https://raw.githubusercontent.com/030201xz/shadcn-registries/main/registries/better-upload/output/{name}.json"
  }
}
```

Install components:

```bash
npx shadcn@latest add @better-upload/upload-button
npx shadcn@latest add @better-upload/upload-dropzone
npx shadcn@latest add @better-upload/upload-dropzone-progress
```

## Components

- `upload-button` - Simple upload button with loading state
- `upload-dropzone` - Drag and drop file upload zone
- `upload-dropzone-progress` - Dropzone with upload progress indicator

## Sync

```bash
bun run registries/better-upload/scripts/sync.ts
```
