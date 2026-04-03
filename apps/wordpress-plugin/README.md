# WordPress Companion Plugin

The WordPress companion plugin lives in:

`apps/wordpress-plugin/figma2elementor/figma2elementor.php`

What it does:

- stores your Figma2Element platform URL and API key
- fetches completed conversion jobs from `/api/jobs`
- downloads a selected export from `/api/jobs/{id}/download`
- sideloads remote asset URLs into the local WordPress media library
- creates an `elementor_library` template post with the imported Elementor JSON

Basic setup:

1. Copy the `figma2elementor` folder into your WordPress site's `wp-content/plugins/`
2. Activate `Figma2Elementor Importer`
3. Open `Tools -> Figma2Elementor`
4. Save your platform URL and API key
5. Choose a completed job and import it into Elementor

Requirements:

- WordPress admin access
- Elementor installed and active
- a Figma2Element platform URL exposing the Laravel API routes
