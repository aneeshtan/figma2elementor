# Figma2Element

Figma2Element is an MVP foundation for a platform that converts Figma frames into importable Elementor template JSON.

This repository is intentionally dependency-light so the core product shape is clear before adding billing, auth, queues, storage, and WordPress automation.

This project is licensed under the MIT license for open-source use.

## What is included

- A local product site with a conversion playground
- A local dashboard with persistent API keys, plan limits, and saved jobs
- A small HTTP API that accepts a simplified Figma node tree and returns Elementor JSON
- A shared conversion pipeline that maps Figma-like nodes into Elementor containers and widgets
- A Figma plugin skeleton that serializes the current selection and sends it to the local API
- A sample Figma document payload and a script that generates a demo Elementor template file

## Repository layout

- `apps/web`
  - marketing page
  - local API server
  - platform dashboard
  - live conversion playground
- `apps/platform`
  - Laravel auth app
  - Stripe subscription billing
  - API key management
  - conversion job dashboard
- `apps/figma-plugin`
  - plugin manifest
  - plugin controller
  - plugin UI
  - publishable icon asset
- `docs`
  - Figma plugin publishing checklist
  - Figma Community listing copy
- `packages/converter`
  - Figma node normalization
  - Elementor JSON generation
- `examples`
  - example Figma payload
  - generated Elementor output
- `data`
  - committed seed state for local bootstrap
  - ignored local runtime account state and persisted conversion jobs
- `scripts`
  - sample conversion runner

## Run locally

1. Start the local app:

```bash
npm run dev
```

2. Open `http://127.0.0.1:4173`
3. Copy the default API key from the dashboard
4. In Figma, import the plugin from `apps/figma-plugin/manifest.json`
5. Paste the API key into the plugin, select a frame, and run the conversion
6. Download the generated Elementor JSON
7. Import that JSON into Elementor's template library

## Publish the Figma plugin

This repo now includes a publish-ready manifest with restricted network access and a production default endpoint.

Start here:

- [docs/FIGMA_PLUGIN_PUBLISHING.md](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/docs/FIGMA_PLUGIN_PUBLISHING.md)
- [docs/FIGMA_PLUGIN_LISTING.md](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/docs/FIGMA_PLUGIN_LISTING.md)
- [apps/figma-plugin/assets/icon.svg](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/apps/figma-plugin/assets/icon.svg)

Default local development key:

```text
f2e_live_local_plugin_key
```

Runtime state is written to `data/platform.local.json` on first boot, seeded from [data/platform.seed.json](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/data/platform.seed.json). Generated export jobs stay local and are ignored by git.

Example authenticated conversion request:

```bash
curl -X POST http://127.0.0.1:4173/api/convert \
  -H "Content-Type: application/json" \
  -H "x-api-key: f2e_live_local_plugin_key" \
  -d @examples/landing-page.figjson
```

## Current MVP scope

Supported first-pass mappings:

- auto-layout frames to Elementor containers
- text layers to heading or text widgets
- simple image layers to image widgets when an image URL is present
- button-like frames to button widgets
- decorative shapes to boxed containers

Current platform capabilities:

- persistent local account state
- pricing plans and export quotas
- API key generation
- saved conversion jobs with download endpoints
- plugin and playground authentication
- Laravel platform scaffold with auth and Stripe billing in `apps/platform`

Partially implemented now:

- Laravel Breeze authentication
- Laravel Cashier subscription billing
- hosted Stripe Checkout and Billing Portal routes
- hashed API key management
- conversion job persistence model

Still not implemented yet:

- full asset upload pipeline
- wiring the Node converter into Laravel runtime
- teams and seat-based billing
- background jobs and queue retries
- WordPress plugin automation
- advanced responsive rules
- full coverage for Figma effects, variants, constraints, and complex widgets

## Recommended next build steps

1. Move API key verification and job persistence from `apps/web` into `apps/platform`.
2. Add Stripe webhook handling and quota enforcement in Laravel.
3. Add signed asset upload and media handling for WordPress.
4. Expand the mapper for Forms, Icons, Tabs, Accordions, Sliders, WooCommerce widgets, and responsive breakpoints.
5. Add a WordPress companion plugin for one-click import and media sync.
6. Add regression fixtures using real exported Figma selections and expected Elementor JSON snapshots.

## Open-source publishing

1. Create a new empty repository on your git host.
2. Add it as `origin`.
3. Push `main`.

Example:

```bash
git remote add origin <your-repo-url>
git push -u origin main
```
