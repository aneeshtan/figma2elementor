# Contributing

## Local development

1. Start the local server:

```bash
npm run dev
```

2. Open `http://127.0.0.1:4173`
3. Import the Figma plugin from `apps/figma-plugin/manifest.json`
4. Use the dashboard API key or create a new one

## Project conventions

- Keep the repository dependency-light unless a new dependency clearly reduces complexity.
- Preserve the current split between `apps/`, `packages/`, `examples/`, and local runtime `data/`.
- Treat files under `data/` as local runtime state unless they are explicit seed files.
- Add or update example fixtures when changing the conversion mapper.

## Pull requests

- Describe the user-visible behavior change.
- Include verification steps.
- If mapper output changes, include before or after fixture details.

