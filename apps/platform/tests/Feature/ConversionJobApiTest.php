<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\ConversionJob;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversionJobApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_jobs_endpoint_requires_a_valid_api_key(): void
    {
        $response = $this->getJson('/api/jobs');

        $response
            ->assertUnauthorized()
            ->assertJson([
                'ok' => false,
                'error' => 'A valid API key is required.',
            ]);
    }

    public function test_jobs_endpoint_returns_jobs_for_the_api_key_owner(): void
    {
        [$user, $token, $apiKey] = $this->makeApiKey();

        $job = ConversionJob::query()->create([
            'user_id' => $user->id,
            'api_key_id' => $apiKey->id,
            'source_name' => 'Hero Section',
            'status' => 'completed',
            'credits_used' => 1,
            'export_name' => 'Hero Template',
            'meta' => [
                'report' => ['convertedNodes' => 12],
                'template' => ['title' => 'Hero Template'],
            ],
            'completed_at' => now(),
        ]);

        $response = $this->withHeaders([
            'x-api-key' => $token,
        ])->getJson('/api/jobs');

        $response
            ->assertOk()
            ->assertJson([
                'ok' => true,
                'jobs' => [
                    [
                        'id' => (string) $job->id,
                        'source_name' => 'Hero Section',
                        'export_name' => 'Hero Template',
                        'status' => 'completed',
                    ],
                ],
            ]);
    }

    public function test_download_endpoint_returns_template_for_owned_job(): void
    {
        [$user, $token, $apiKey] = $this->makeApiKey();

        $job = ConversionJob::query()->create([
            'user_id' => $user->id,
            'api_key_id' => $apiKey->id,
            'source_name' => 'Offerings Slider',
            'status' => 'completed',
            'credits_used' => 1,
            'export_name' => 'Offerings Template',
            'meta' => [
                'report' => ['convertedNodes' => 18],
                'template' => [
                    'title' => 'Offerings Template',
                    'content' => [['elType' => 'container']],
                ],
            ],
            'completed_at' => now(),
        ]);

        $response = $this->withHeaders([
            'x-api-key' => $token,
        ])->getJson("/api/jobs/{$job->id}/download");

        $response
            ->assertOk()
            ->assertJson([
                'ok' => true,
                'job' => [
                    'id' => (string) $job->id,
                    'source_name' => 'Offerings Slider',
                    'export_name' => 'Offerings Template',
                ],
                'template' => [
                    'title' => 'Offerings Template',
                ],
            ]);
    }

    public function test_download_endpoint_rejects_jobs_from_other_accounts(): void
    {
        [$user, $token] = $this->makeApiKey();
        [$otherUser, , $otherApiKey] = $this->makeApiKey();

        $job = ConversionJob::query()->create([
            'user_id' => $otherUser->id,
            'api_key_id' => $otherApiKey->id,
            'source_name' => 'Private Template',
            'status' => 'completed',
            'credits_used' => 1,
            'export_name' => 'Private Template',
            'meta' => [
                'template' => ['title' => 'Private Template'],
            ],
            'completed_at' => now(),
        ]);

        $response = $this->withHeaders([
            'x-api-key' => $token,
        ])->getJson("/api/jobs/{$job->id}/download");

        $response
            ->assertNotFound()
            ->assertJson([
                'ok' => false,
                'error' => 'This conversion job is not available for the supplied API key.',
            ]);
    }

    private function makeApiKey(): array
    {
        $user = User::factory()->create();
        $token = 'f2e_test_'.bin2hex(random_bytes(12));
        $apiKey = ApiKey::query()->create([
            'user_id' => $user->id,
            'name' => 'Test Key',
            'key_prefix' => substr($token, 0, 12),
            'key_hash' => hash('sha256', $token),
        ]);

        return [$user, $token, $apiKey];
    }
}
