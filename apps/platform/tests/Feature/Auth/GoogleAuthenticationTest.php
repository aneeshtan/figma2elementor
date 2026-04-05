<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\User as SocialiteUserContract;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.google.client_id', 'test-google-client-id');
        config()->set('services.google.client_secret', 'test-google-client-secret');
        config()->set('services.google.redirect', 'http://127.0.0.1:8000/auth/google/callback');
    }

    public function test_google_redirect_route_is_available(): void
    {
        $provider = Mockery::mock();
        $provider->shouldReceive('scopes')->once()->with(['openid', 'profile', 'email'])->andReturnSelf();
        $provider->shouldReceive('redirect')->once()->andReturn(redirect('https://accounts.google.com/o/oauth2/auth'));

        Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

        $response = $this->get(route('auth.google.redirect'));

        $response->assertRedirect('https://accounts.google.com/o/oauth2/auth');
    }

    public function test_google_callback_creates_and_authenticates_a_user(): void
    {
        $socialiteUser = Mockery::mock(SocialiteUserContract::class);
        $socialiteUser->shouldReceive('getEmail')->andReturn('google-user@example.com');
        $socialiteUser->shouldReceive('getId')->andReturn('google-123');
        $socialiteUser->shouldReceive('getName')->andReturn('Google User');
        $socialiteUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.png');

        $provider = Mockery::mock();
        $provider->shouldReceive('user')->once()->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

        $response = $this->get(route('auth.google.callback'));

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'google-user@example.com')->first();

        $this->assertNotNull($user);
        $this->assertSame('google', $user->auth_provider);
        $this->assertSame('google-123', $user->auth_provider_id);
        $this->assertSame('https://example.com/avatar.png', $user->avatar_url);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_google_callback_links_existing_user_by_email(): void
    {
        $existingUser = User::factory()->create([
            'email' => 'linked-user@example.com',
            'email_verified_at' => null,
        ]);

        $socialiteUser = Mockery::mock(SocialiteUserContract::class);
        $socialiteUser->shouldReceive('getEmail')->andReturn('linked-user@example.com');
        $socialiteUser->shouldReceive('getId')->andReturn('google-linked-123');
        $socialiteUser->shouldReceive('getName')->andReturn('Linked User');
        $socialiteUser->shouldReceive('getAvatar')->andReturn('https://example.com/linked-avatar.png');

        $provider = Mockery::mock();
        $provider->shouldReceive('user')->once()->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

        $response = $this->get(route('auth.google.callback'));

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($existingUser->fresh());

        $existingUser->refresh();

        $this->assertSame('google', $existingUser->auth_provider);
        $this->assertSame('google-linked-123', $existingUser->auth_provider_id);
        $this->assertSame('https://example.com/linked-avatar.png', $existingUser->avatar_url);
        $this->assertNotNull($existingUser->email_verified_at);
    }
}
