# Figma Plugin Publishing

This repository includes a development plugin and the minimum publish-ready metadata needed to submit it through the Figma desktop app.

## What is already prepared

- [apps/figma-plugin/manifest.json](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/apps/figma-plugin/manifest.json)
  - restricted `networkAccess`
  - production API domain set to `https://f2e.ctrlaltl.com`
- [apps/figma-plugin/ui.html](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/apps/figma-plugin/ui.html)
  - hosted API endpoint is fixed in the UI
  - API key is entered by the user and saved locally in Figma client storage
- [apps/figma-plugin/assets/icon.svg](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/apps/figma-plugin/assets/icon.svg)
  - starter icon you can use for the 128 x 128 listing icon
- [docs/FIGMA_PLUGIN_LISTING.md](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/docs/FIGMA_PLUGIN_LISTING.md)
  - suggested marketplace copy

## Publish flow

1. Open Figma Desktop.
2. Create or open any Figma file.
3. Go to `Plugins` -> `Development` -> `Import plugin from manifest...`
4. Choose [apps/figma-plugin/manifest.json](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/apps/figma-plugin/manifest.json)
5. Confirm the plugin works against:
   - Production: `https://f2e.ctrlaltl.com/api/convert`
   - The plugin requests the user's own API key instead of shipping with one prefilled
6. In Figma Desktop, go to `Plugins` -> `Manage plugins`
7. Find `Figma2Element Converter`
8. Open the plugin menu and choose `Publish`
9. Fill in the listing fields using [docs/FIGMA_PLUGIN_LISTING.md](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/docs/FIGMA_PLUGIN_LISTING.md)
10. Upload:
   - icon: use [apps/figma-plugin/assets/icon.svg](/Users/farshad.ghanzanfari/Documents/www/Figma2Element/apps/figma-plugin/assets/icon.svg) exported as 128 x 128 PNG if needed
   - thumbnail: prepare a 1920 x 1080 image showing the plugin UI and generated Elementor JSON
11. Add your support contact and review the network access disclosure
12. Add the public privacy page `https://f2e.ctrlaltl.com/privacy`
13. Submit for review

## Before submitting

- Enable two-factor authentication on the Figma account that will publish the plugin.
- If Figma assigns a different plugin `id` during the publish flow, keep that assigned `id` in the manifest for future updates.
- If you change the hosted API domain later, update `networkAccess.allowedDomains` before submitting updates.

## Notes

- Figma review applies to Community plugins. Private organization distribution has a different path.
- The current plugin is still lightweight and does not yet bundle advanced asset upload or WordPress sync.

## Official references

- Figma Help: [Publish plugins to the Figma Community](https://help.figma.com/hc/en-us/articles/360042293394-Publish-plugins-to-the-Figma-Community)
- Figma Docs: [Plugin Manifest](https://developers.figma.com/docs/plugins/manifest/)
- Figma Docs: [Making Network Requests](https://developers.figma.com/docs/plugins/making-network-requests/)
