<?php

namespace Tests\Feature;

use App\Models\ConversionJob;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardExportDownloadTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_download_a_recent_export_from_the_dashboard(): void
    {
        $user = User::factory()->create();
        $job = ConversionJob::query()->create([
            'user_id' => $user->id,
            'source_name' => 'Related Offerings',
            'status' => 'completed',
            'credits_used' => 1,
            'export_name' => 'Related Offerings Template',
            'meta' => [
                'template' => [
                    'title' => 'Related Offerings Template',
                    'content' => [['elType' => 'container']],
                ],
            ],
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('dashboard.jobs.download', $job));

        $response
            ->assertOk()
            ->assertHeader('content-type', 'application/json; charset=UTF-8');

        $this->assertStringContainsString('"title": "Related Offerings Template"', $response->streamedContent());
        $this->assertStringContainsString((string) $job->id.'.json', (string) $response->headers->get('content-disposition'));
    }

    public function test_user_is_redirected_when_export_template_is_missing(): void
    {
        $user = User::factory()->create();
        $job = ConversionJob::query()->create([
            'user_id' => $user->id,
            'source_name' => 'Missing Export',
            'status' => 'completed',
            'credits_used' => 1,
            'export_name' => 'Missing Export',
            'meta' => [],
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('dashboard.jobs.download', $job));

        $response
            ->assertRedirect(route('dashboard', absolute: false))
            ->assertSessionHas('status', 'This export is no longer available for download.');
    }

    public function test_user_cannot_download_someone_elses_export(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $job = ConversionJob::query()->create([
            'user_id' => $otherUser->id,
            'source_name' => 'Private Export',
            'status' => 'completed',
            'credits_used' => 1,
            'export_name' => 'Private Export',
            'meta' => [
                'template' => [
                    'title' => 'Private Export',
                ],
            ],
            'completed_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard.jobs.download', $job))
            ->assertNotFound();
    }
}
