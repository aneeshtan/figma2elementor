# Figma2Element Platform

This Laravel app is the account, billing, and subscription layer for Figma2Element.

Included:

- Laravel Breeze authentication
- Laravel Cashier for Stripe subscriptions
- hosted Stripe Checkout and Billing Portal routes
- hashed API key management for the Figma plugin
- conversion job models and dashboard scaffolding

## Local setup

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Add your Stripe values:

```text
STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
```

3. Install dependencies and migrate:

```bash
composer install
npm install
php artisan migrate
```

4. Run the app:

```bash
composer run dev
```

## Main routes

- `/login`
- `/register`
- `/dashboard`
- `POST /billing/checkout/{plan}`
- `GET /billing/portal`

## Current scope

This app is intentionally the platform layer only. The existing Node app in `/apps/web` still runs the current converter MVP. The next integration step is moving API key validation, usage metering, and conversion job persistence into Laravel.
