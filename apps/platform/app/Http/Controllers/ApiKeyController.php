<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApiKeyController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
        ]);

        $plainTextKey = 'f2e_live_'.Str::lower(Str::random(40));

        $request->user()->apiKeys()->create([
            'name' => $validated['name'],
            'key_prefix' => substr($plainTextKey, 0, 12),
            'key_hash' => hash('sha256', $plainTextKey),
        ]);

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
