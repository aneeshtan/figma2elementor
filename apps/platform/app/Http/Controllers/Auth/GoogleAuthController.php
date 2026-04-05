<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        if (! $this->isConfigured()) {
            return redirect()
                ->route('login')
                ->with('status', 'Google login is not configured yet. Add Google OAuth credentials first.');
        }

        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    public function callback(): RedirectResponse
    {
        if (! $this->isConfigured()) {
            return redirect()
                ->route('login')
                ->with('status', 'Google login is not configured yet. Add Google OAuth credentials first.');
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable) {
            return redirect()
                ->route('login')
                ->with('status', 'Google authentication failed. Please try again.');
        }

        $email = $googleUser->getEmail();
        $providerFieldsAvailable = $this->providerFieldsAvailable();

        if (! $email) {
            return redirect()
                ->route('login')
                ->with('status', 'Google did not return an email address for this account.');
        }

        try {
            $user = User::query()
                ->when($providerFieldsAvailable, function ($query) use ($googleUser) {
                    $query->where(function ($providerQuery) use ($googleUser) {
                        $providerQuery->where('auth_provider', 'google')
                            ->where('auth_provider_id', $googleUser->getId());
                    });
                })
                ->orWhere('email', $email)
                ->first();

            if (! $user) {
                $attributes = [
                    'name' => $googleUser->getName() ?: Str::before($email, '@'),
                    'email' => $email,
                    'password' => Hash::make(Str::random(32)),
                    'email_verified_at' => now(),
                ];

                if ($providerFieldsAvailable) {
                    $attributes['auth_provider'] = 'google';
                    $attributes['auth_provider_id'] = $googleUser->getId();
                    $attributes['avatar_url'] = $googleUser->getAvatar();
                }

                $user = User::create($attributes);
            } else {
                $attributes = [
                    'name' => $user->name ?: ($googleUser->getName() ?: Str::before($email, '@')),
                    'email_verified_at' => $user->email_verified_at ?: now(),
                ];

                if ($providerFieldsAvailable) {
                    $attributes['auth_provider'] = 'google';
                    $attributes['auth_provider_id'] = $googleUser->getId();
                    $attributes['avatar_url'] = $googleUser->getAvatar() ?: $user->avatar_url;
                }

                $user->forceFill($attributes)->save();
            }
        } catch (\Throwable) {
            return redirect()
                ->route('login')
                ->with('status', 'Google login could not be completed on this server yet. Try again after the latest migration is deployed.');
        }

        Auth::login($user, true);
        request()->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    protected function isConfigured(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'))
            && filled(config('services.google.redirect'));
    }

    protected function providerFieldsAvailable(): bool
    {
        return Schema::hasColumn('users', 'auth_provider')
            && Schema::hasColumn('users', 'auth_provider_id')
            && Schema::hasColumn('users', 'avatar_url');
    }
}
