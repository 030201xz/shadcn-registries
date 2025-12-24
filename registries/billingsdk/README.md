# BillingSDK

Pricing tables, subscription management, and billing UI components.

## Source

- **Homepage**: https://billingsdk.com
- **Registry URL**: https://billingsdk.com/r

## Usage

Add to your `components.json`:

```json
{
  "registries": {
    "@billingsdk": "https://raw.githubusercontent.com/030201xz/shadcn-registries/main/registries/billingsdk/output/{name}.json"
  }
}
```

Install components:

```bash
npx shadcn@latest add @billingsdk/pricing-table-one
npx shadcn@latest add @billingsdk/subscription-management
npx shadcn@latest add @billingsdk/invoice-history
```

## Components

- `pricing-table-*` - Various pricing table designs
- `subscription-management` - Subscription management component
- `cancel-subscription-*` - Cancellation dialogs and cards
- `update-plan-*` - Plan update components
- `invoice-history` - Invoice history table
- `payment-details` - Payment details form
- And more...

## Sync

```bash
bun run registries/billingsdk/scripts/sync.ts
```
