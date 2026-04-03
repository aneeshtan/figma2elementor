<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiKeyManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_an_api_key_and_copy_it_later(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/api-keys', [
            'name' => 'Production plugin key',
        ]);

        $response
            ->assertRedirect(route('dashboard', absolute: false))
            ->assertSessionHas('plain_text_api_key');

        $apiKey = ApiKey::query()->sole();

        $this->assertNotNull($apiKey->plain_text_key);
        $this->assertStringStartsWith('f2e_live_', $apiKey->plain_text_key);
        $this->assertSame(hash('sha256', $apiKey->plain_text_key), $apiKey->key_hash);
    }

    public function test_user_cannot_create_more_than_two_active_api_keys(): void
    {
        $user = User::factory()->create();

        ApiKey::query()->create([
            'user_id' => $user->id,
            'name' => 'Primary key',
            'key_prefix' => 'f2e_live_aaa',
            'key_hash' => hash('sha256', 'f2e_live_primary'),
            'plain_text_key' => 'f2e_live_primary',
        ]);

        ApiKey::query()->create([
            'user_id' => $user->id,
            'name' => 'Secondary key',
            'key_prefix' => 'f2e_live_bbb',
            'key_hash' => hash('sha256', 'f2e_live_secondary'),
            'plain_text_key' => 'f2e_live_secondary',
        ]);

        $response = $this->actingAs($user)->from('/dashboard')->post('/api-keys', [
            'name' => 'Overflow key',
        ]);

        $response
            ->assertRedirect('/dashboard')
            ->assertSessionHasErrors('api_keys');

        $this->assertSame(2, $user->apiKeys()->whereNull('revoked_at')->count());
    }

    public function test_dashboard_hides_revoked_keys_and_marks_legacy_active_keys_as_not_copyable(): void
    {
        $user = User::factory()->create();

        ApiKey::query()->create([
            'user_id' => $user->id,
            'name' => 'Legacy key',
            'key_prefix' => 'f2e_live_legacy',
            'key_hash' => hash('sha256', 'f2e_live_legacy_secret'),
        ]);

        ApiKey::query()->create([
            'user_id' => $user->id,
            'name' => 'Current key',
            'key_prefix' => 'f2e_live_modern',
            'key_hash' => hash('sha256', 'f2e_live_modern_secret'),
            'plain_text_key' => 'f2e_live_modern_secret',
        ]);

        ApiKey::query()->create([
            'user_id' => $user->id,
            'name' => 'Revoked key',
            'key_prefix' => 'f2e_live_revoked',
            'key_hash' => hash('sha256', 'f2e_live_revoked_secret'),
            'plain_text_key' => 'f2e_live_revoked_secret',
            'revoked_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response
            ->assertOk()
            ->assertSee('2/2 active keys in use.')
            ->assertSee('This active key was created before copy support. Create a replacement key if you need a copyable secret.')
            ->assertSee('Legacy key')
            ->assertSee('Copy key')
            ->assertDontSee('Revoked key');
    }
}
