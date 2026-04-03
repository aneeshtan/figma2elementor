# Figma2Element

Figma2Element is an MVP foundation for a platform that converts Figma frames into importable Elementor template JSON.

This repository now has a merged application surface: Laravel is the public app for landing pages, auth, billing, dashboard, and the public plugin endpoint, while the original Node server remains the internal converter engine.

This project is licensed under the MIT license for open-source use.

## What is included

- A Laravel app for signup, login, billing, API keys, and conversion jobs
- A public conversion API exposed from Laravel at `/api/convert`
- An internal Node conversion service that Laravel proxies to
- A shared conversion pipeline that maps Figma-like nodes into Elementor containers and widgets
- A Figma plugin that serializes the current selection and sends it to the Laravel API
- A sample Figma document payload and a script that generates a demo Elementor template file

## Repository layout

- `apps/web`
  - internal converter service
  - legacy MVP frontend
  - local asset and job export service
- `apps/platform`
  - public Laravel app
  - auth and registration
  - Stripe subscription billing
  - API key management
  - conversion job dashboard
  - public `/api/convert` proxy
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

1. Start the internal converter service:

```bash
npm run dev
```

2. Start the Laravel platform:

```bash
cd apps/platform
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
composer run dev
```

3. Open `http://127.0.0.1:8000`
4. Register or sign in
5. Create an API key in the dashboard
6. In Figma, import the plugin from `apps/figma-plugin/manifest.json`
7. Set the plugin endpoint to `http://127.0.0.1:8000/api/convert`
8. Paste the API key into the plugin, select a frame, and run the conversion
9. Download the generated Elementor JSON
10. Import that JSON into Elementor's template library

## Publish the Figma plugin

This repo now includes a publish-ready manifest with restricted network access and a production default endpoint.

Start here:

- [docs/FIGMA_PLUGIN_PUBLISHING.md](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/docs/FIGMA_PLUGIN_PUBLISHING.md)
- [docs/FIGMA_PLUGIN_LISTING.md](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/docs/FIGMA_PLUGIN_LISTING.md)
- [apps/figma-plugin/assets/icon.svg](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/apps/figma-plugin/assets/icon.svg)

Runtime state is written to `data/platform.local.json` on first boot, seeded from [data/platform.seed.json](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/data/platform.seed.json). Generated export jobs stay local and are ignored by git.

Example authenticated conversion request:

```bash
curl -X POST http://127.0.0.1:8000/api/convert \
  -H "Content-Type: application/json" \
  -H "x-api-key: <your-laravel-api-key>" \
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

- Laravel Breeze authentication
- Laravel Cashier subscription billing
- hosted Stripe Checkout and Billing Portal routes
- hashed API key management
- conversion job persistence
- public proxy routes for `/api/convert` and `/api/assets/*`
- Laravel landing page and dashboard as the primary user-facing app

## Figma export contract

For higher-fidelity exports, the plugin and converter now understand a small naming contract:

- `el-container:name`, `el-button:name`, `el-heading:name`, `el-text-editor:name`, `el-image:name`, `el-divider:name`, `el-spacer:name`
- `el-form:name` with direct children like `el-input:name`, `el-email:email`, `el-tel:phone`, `el-select:service`, `el-textarea:message`, `el-submit:submit`
- `[slider]` or `[carousel]` on the root slider frame
- `[track]` on the slide track wrapper
- `[slide]` or `[card]` on each repeated slide card
- `[dots]` on pagination wrapper and `[dot]` on each pagination item
- `[button]` on CTA groups or components
- `[media]` on image/media regions and `[content]` on text/content regions
- motion tokens in names such as `motion:autoplay`, `motion:grow`, `motion:lift`, `motion:fade-up`

The Figma plugin also exports component variant metadata and prototype reactions. When a button or card is backed by a component set with `Default` and `Hover` variants, the converter now uses that hover state instead of guessing hover colors.

Use `el-*` names when you want strict widget mapping. Use semantic roles and motion tokens when you want higher-fidelity interactive sections like sliders and hover-aware cards.

Still not implemented yet:

- teams and seat-based billing
- background jobs and queue retries
- WordPress plugin automation
- advanced responsive rules
- full coverage for Figma effects, variants, constraints, and complex widgets

## Recommended next build steps

1. Retire the legacy `apps/web` frontend and keep it as converter-service-only code.
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
