<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ApiKeyController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
        ]);

        $activeKeyCount = $request->user()
            ->apiKeys()
            ->whereNull('revoked_at')
            ->count();

        if ($activeKeyCount >= 2) {
            throw ValidationException::withMessages([
                'api_keys' => 'You can only keep two active API keys at a time. Revoke one before creating another.',
            ]);
        }

        $plainTextKey = 'f2e_live_'.Str::lower(Str::random(40));

        $attributes = [
            'name' => $validated['name'],
            'key_prefix' => substr($plainTextKey, 0, 12),
            'key_hash' => hash('sha256', $plainTextKey),
        ];

        if (Schema::hasColumn('api_keys', 'plain_text_key')) {
            $attributes['plain_text_key'] = $plainTextKey;
        }

        $request->user()->apiKeys()->create($attributes);

        return redirect()
            ->route('dashboard')
            ->with('status', 'API key created.')
            ->with('plain_text_api_key', $plainTextKey);
    }

    public function destroy(Request $request, string $apiKey): RedirectResponse
    {
        $key = $request->user()->apiKeys()->findOrFail($apiKey);
        $key->update([
            'revoked_at' => now(),
        ]);

        return redirect()
            ->route('dashboard')
            ->with('status', 'API key revoked.');
    }
}
