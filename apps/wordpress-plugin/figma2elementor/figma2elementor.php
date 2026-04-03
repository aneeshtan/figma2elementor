<?php
/**
 * Plugin Name: Figma2Elementor Importer
 * Plugin URI: https://github.com/aneeshtan/figma2elementor
 * Description: Fetch completed exports from Figma2Element and import them into Elementor with WordPress media sideloading.
 * Version: 0.4.0
 * Author: Farshad and AI
 * Author URI: https://github.com/aneeshtan/figma2elementor
 * License: MIT
 */

if (! defined('ABSPATH')) {
    exit;
}

if (! class_exists('F2E_Elementor_Importer')) {
    final class F2E_Elementor_Importer
    {
        private const OPTION_GROUP = 'f2e_importer';
        private const OPTION_PLATFORM_URL = 'f2e_platform_url';
        private const OPTION_API_KEY = 'f2e_api_key';
        private const NONCE_ACTION = 'f2e_import_job';
        private const PAGE_SLUG = 'f2e-importer';

        public static function boot(): void
        {
            $instance = new self();
            $instance->register();
        }

        public function register(): void
        {
            add_action('admin_menu', [$this, 'registerAdminPage']);
            add_action('admin_init', [$this, 'registerSettings']);
            add_action('admin_post_f2e_import_job', [$this, 'handleImport']);
            add_action('admin_notices', [$this, 'renderNotices']);
        }

        public function registerAdminPage(): void
        {
            add_management_page(
                'Figma2Elementor Importer',
                'Figma2Elementor',
                'manage_options',
                self::PAGE_SLUG,
                [$this, 'renderAdminPage']
            );
        }

        public function registerSettings(): void
        {
            register_setting(self::OPTION_GROUP, self::OPTION_PLATFORM_URL, [
                'type' => 'string',
                'sanitize_callback' => static function ($value): string {
                    return untrailingslashit(esc_url_raw((string) $value));
                },
                'default' => '',
            ]);

            register_setting(self::OPTION_GROUP, self::OPTION_API_KEY, [
                'type' => 'string',
                'sanitize_callback' => static function ($value): string {
                    return trim((string) $value);
                },
                'default' => '',
            ]);
        }

        public function renderAdminPage(): void
        {
            if (! current_user_can('manage_options')) {
                return;
            }

            $platformUrl = $this->getPlatformUrl();
            $apiKey = $this->getApiKey();
            $jobs = [];
            $jobsError = '';

            if ($platformUrl && $apiKey) {
                $jobsResponse = $this->apiRequest('/api/jobs');
                if (is_wp_error($jobsResponse)) {
                    $jobsError = $jobsResponse->get_error_message();
                } else {
                    $jobs = isset($jobsResponse['jobs']) && is_array($jobsResponse['jobs']) ? $jobsResponse['jobs'] : [];
                }
            }
            ?>
            <div class="wrap">
                <h1>Figma2Elementor Importer</h1>
                <p>Connect your WordPress site to your Figma2Element platform, fetch completed jobs, and import them into Elementor.</p>

                <form method="post" action="options.php" style="max-width:720px;margin-top:24px;">
                    <?php settings_fields(self::OPTION_GROUP); ?>
                    <table class="form-table" role="presentation">
                        <tr>
                            <th scope="row"><label for="<?php echo esc_attr(self::OPTION_PLATFORM_URL); ?>">Platform URL</label></th>
                            <td>
                                <input
                                    id="<?php echo esc_attr(self::OPTION_PLATFORM_URL); ?>"
                                    name="<?php echo esc_attr(self::OPTION_PLATFORM_URL); ?>"
                                    type="url"
                                    class="regular-text code"
                                    placeholder="https://figma2elementor.ctrlaltl.com"
                                    value="<?php echo esc_attr($platformUrl); ?>"
                                />
                                <p class="description">Public Laravel app URL that exposes <code>/api/jobs</code> and <code>/api/jobs/{id}/download</code>.</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="<?php echo esc_attr(self::OPTION_API_KEY); ?>">API key</label></th>
                            <td>
                                <input
                                    id="<?php echo esc_attr(self::OPTION_API_KEY); ?>"
                                    name="<?php echo esc_attr(self::OPTION_API_KEY); ?>"
                                    type="text"
                                    class="regular-text code"
                                    value="<?php echo esc_attr($apiKey); ?>"
                                />
                                <p class="description">Use an API key from your Figma2Element dashboard.</p>
                            </td>
                        </tr>
                    </table>
                    <?php submit_button('Save connection'); ?>
                </form>

                <hr style="margin:32px 0;" />

                <h2>Import completed job</h2>
                <?php if (! defined('ELEMENTOR_VERSION')) : ?>
                    <div class="notice notice-warning inline"><p>Elementor is not active. The importer can fetch jobs, but it cannot create Elementor templates until Elementor is installed and enabled.</p></div>
                <?php endif; ?>

                <?php if (! $platformUrl || ! $apiKey) : ?>
                    <div class="notice notice-info inline"><p>Save your platform URL and API key first.</p></div>
                <?php elseif ($jobsError) : ?>
                    <div class="notice notice-error inline"><p><?php echo esc_html($jobsError); ?></p></div>
                <?php else : ?>
                    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="max-width:720px;">
                        <?php wp_nonce_field(self::NONCE_ACTION); ?>
                        <input type="hidden" name="action" value="f2e_import_job" />
                        <table class="form-table" role="presentation">
                            <tr>
                                <th scope="row"><label for="f2e_job_id">Completed job</label></th>
                                <td>
                                    <select id="f2e_job_id" name="job_id" class="regular-text">
                                        <option value="">Select a job</option>
                                        <?php foreach ($jobs as $job) : ?>
                                            <option value="<?php echo esc_attr((string) ($job['id'] ?? '')); ?>">
                                                <?php
                                                echo esc_html(sprintf(
                                                    '%s · %s · %s',
                                                    (string) ($job['export_name'] ?? $job['source_name'] ?? 'Untitled export'),
                                                    (string) ($job['status'] ?? 'unknown'),
                                                    (string) ($job['completed_at'] ?? 'pending')
                                                ));
                                                ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                    <p class="description">Imports the selected export into Elementor and rewrites hosted asset URLs into local WordPress media uploads.</p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><label for="f2e_job_id_manual">Manual job ID</label></th>
                                <td>
                                    <input id="f2e_job_id_manual" name="job_id_manual" type="text" class="regular-text code" />
                                    <p class="description">Optional fallback if you want to paste a job ID directly.</p>
                                </td>
                            </tr>
                        </table>
                        <?php submit_button('Import into Elementor'); ?>
                    </form>
                <?php endif; ?>
            </div>
            <?php
        }

        public function handleImport(): void
        {
            if (! current_user_can('manage_options')) {
                wp_die('You do not have permission to import Figma2Element jobs.');
            }

            check_admin_referer(self::NONCE_ACTION);

            if (! defined('ELEMENTOR_VERSION')) {
                $this->redirectWithNotice('error', 'Elementor must be active before imports can be created.');
            }

            $jobId = sanitize_text_field((string) ($_POST['job_id_manual'] ?? ''));
            if ($jobId === '') {
                $jobId = sanitize_text_field((string) ($_POST['job_id'] ?? ''));
            }

            if ($jobId === '') {
                $this->redirectWithNotice('error', 'Choose a completed job or paste a job ID.');
            }

            $response = $this->apiRequest('/api/jobs/'.rawurlencode($jobId).'/download');
            if (is_wp_error($response)) {
                $this->redirectWithNotice('error', $response->get_error_message());
            }

            $template = isset($response['template']) && is_array($response['template']) ? $response['template'] : null;
            if (! $template) {
                $this->redirectWithNotice('error', 'The selected job does not contain a valid Elementor template.');
            }

            $assetMap = $this->collectAssetMap($template);
            $template = $this->replaceUrlsInValue($template, $assetMap);
            $postId = $this->importTemplate($template, $response['job'] ?? []);

            if (is_wp_error($postId)) {
                $this->redirectWithNotice('error', $postId->get_error_message());
            }

            $editUrl = admin_url('post.php?post='.$postId.'&action=elementor');
            $this->redirectWithNotice('success', sprintf(
                'Imported into Elementor. <a href="%s">Open template</a>.',
                esc_url($editUrl)
            ));
        }

        public function renderNotices(): void
        {
            if (! is_admin()) {
                return;
            }

            $page = isset($_GET['page']) ? sanitize_key((string) $_GET['page']) : '';
            if ($page !== self::PAGE_SLUG) {
                return;
            }

            $status = isset($_GET['f2e_notice']) ? sanitize_key((string) $_GET['f2e_notice']) : '';
            $message = isset($_GET['f2e_message']) ? wp_kses_post(urldecode(wp_unslash((string) $_GET['f2e_message']))) : '';

            if (! $status || ! $message) {
                return;
            }

            $class = $status === 'success' ? 'notice notice-success' : 'notice notice-error';
            echo '<div class="'.esc_attr($class).' is-dismissible"><p>'.$message.'</p></div>';
        }

        private function getPlatformUrl(): string
        {
            return untrailingslashit((string) get_option(self::OPTION_PLATFORM_URL, ''));
        }

        private function getApiKey(): string
        {
            return trim((string) get_option(self::OPTION_API_KEY, ''));
        }

        private function apiRequest(string $path): array|\WP_Error
        {
            $platformUrl = $this->getPlatformUrl();
            $apiKey = $this->getApiKey();

            if ($platformUrl === '' || $apiKey === '') {
                return new \WP_Error('f2e_missing_config', 'Save your Figma2Element platform URL and API key first.');
            }

            $response = wp_remote_get($platformUrl.$path, [
                'timeout' => 60,
                'headers' => [
                    'Accept' => 'application/json',
                    'x-api-key' => $apiKey,
                    'x-client-name' => 'wordpress-plugin',
                    'x-origin-app' => 'wordpress',
                ],
            ]);

            if (is_wp_error($response)) {
                return new \WP_Error('f2e_request_failed', $response->get_error_message());
            }

            $status = (int) wp_remote_retrieve_response_code($response);
            $body = json_decode((string) wp_remote_retrieve_body($response), true);

            if ($status < 200 || $status >= 300 || ! is_array($body)) {
                return new \WP_Error(
                    'f2e_invalid_response',
                    is_array($body) && ! empty($body['error'])
                        ? (string) $body['error']
                        : 'The Figma2Element platform returned an invalid response.'
                );
            }

            return $body;
        }

        private function collectAssetMap(array $template): array
        {
            $urls = [];
            $this->collectUrlsFromValue($template, $urls);

            $map = [];
            foreach (array_unique($urls) as $url) {
                $localUrl = $this->importRemoteAsset($url);
                if ($localUrl) {
                    $map[$url] = $localUrl;
                }
            }

            return $map;
        }

        private function collectUrlsFromValue(mixed $value, array &$urls): void
        {
            if (is_array($value)) {
                foreach ($value as $child) {
                    $this->collectUrlsFromValue($child, $urls);
                }

                return;
            }

            if (! is_string($value)) {
                return;
            }

            if (preg_match_all('#https?://[^\\s"\'<>()]+#i', $value, $matches)) {
                foreach ($matches[0] as $match) {
                    if (preg_match('/(?:\\/api\\/assets\\/|\\.(png|jpe?g|gif|webp|svg))(?:\\?.*)?$/i', $match)) {
                        $urls[] = $match;
                    }
                }
            }
        }

        private function importRemoteAsset(string $url): ?string
        {
            if (! function_exists('download_url')) {
                require_once ABSPATH.'wp-admin/includes/file.php';
            }
            if (! function_exists('wp_handle_sideload')) {
                require_once ABSPATH.'wp-admin/includes/file.php';
            }
            if (! function_exists('wp_insert_attachment')) {
                require_once ABSPATH.'wp-admin/includes/media.php';
                require_once ABSPATH.'wp-admin/includes/image.php';
            }

            $tempFile = download_url($url, 60);
            if (is_wp_error($tempFile)) {
                return null;
            }

            $filename = basename(parse_url($url, PHP_URL_PATH) ?: 'f2e-asset');
            $file = [
                'name' => sanitize_file_name($filename),
                'type' => wp_check_filetype($filename)['type'] ?: 'application/octet-stream',
                'tmp_name' => $tempFile,
                'error' => 0,
                'size' => filesize($tempFile),
            ];

            $sideload = wp_handle_sideload($file, ['test_form' => false]);
            if (! empty($sideload['error'])) {
                @unlink($tempFile);
                return null;
            }

            $attachment = [
                'post_title' => preg_replace('/\\.[^.]+$/', '', $filename),
                'post_mime_type' => $sideload['type'],
                'post_status' => 'inherit',
            ];

            $attachmentId = wp_insert_attachment($attachment, $sideload['file']);
            if (is_wp_error($attachmentId)) {
                return null;
            }

            wp_update_attachment_metadata($attachmentId, wp_generate_attachment_metadata($attachmentId, $sideload['file']));

            return wp_get_attachment_url($attachmentId) ?: null;
        }

        private function replaceUrlsInValue(mixed $value, array $map): mixed
        {
            if (is_array($value)) {
                foreach ($value as $key => $child) {
                    $value[$key] = $this->replaceUrlsInValue($child, $map);
                }

                return $value;
            }

            if (! is_string($value) || $map === []) {
                return $value;
            }

            return str_replace(array_keys($map), array_values($map), $value);
        }

        private function importTemplate(array $template, array $job): int|\WP_Error
        {
            $title = sanitize_text_field((string) ($template['title'] ?? $job['export_name'] ?? 'Imported Figma2Element Template'));
            $content = isset($template['content']) && is_array($template['content']) ? $template['content'] : [];
            $pageSettings = isset($template['page_settings']) && is_array($template['page_settings']) ? $template['page_settings'] : [];
            $templateType = sanitize_key((string) ($template['type'] ?? 'section'));

            $postId = wp_insert_post([
                'post_title' => $title,
                'post_type' => 'elementor_library',
                'post_status' => 'publish',
            ], true);

            if (is_wp_error($postId)) {
                return $postId;
            }

            update_post_meta($postId, '_elementor_edit_mode', 'builder');
            update_post_meta($postId, '_elementor_template_type', $templateType);
            update_post_meta($postId, '_elementor_version', defined('ELEMENTOR_VERSION') ? ELEMENTOR_VERSION : 'unknown');
            update_post_meta($postId, '_elementor_data', wp_slash(wp_json_encode($content)));
            update_post_meta($postId, '_elementor_page_settings', wp_slash(wp_json_encode($pageSettings)));
            update_post_meta($postId, '_f2e_source_job', sanitize_text_field((string) ($job['id'] ?? '')));
            update_post_meta($postId, '_f2e_source_name', sanitize_text_field((string) ($job['source_name'] ?? '')));

            return (int) $postId;
        }

        private function redirectWithNotice(string $status, string $message): void
        {
            $url = add_query_arg([
                'page' => self::PAGE_SLUG,
                'f2e_notice' => $status,
                'f2e_message' => $message,
            ], admin_url('tools.php'));

            wp_safe_redirect($url);
            exit;
        }
    }
}

F2E_Elementor_Importer::boot();
