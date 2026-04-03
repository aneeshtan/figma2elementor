<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Figma2Element Platform') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @if (session('status'))
                <div class="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                    {{ session('status') }}
                </div>
            @endif

            @if (session('plain_text_api_key'))
                <div class="mb-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-4 text-sm text-orange-900 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-100">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p class="font-semibold">Copy this API key now. It is also available from your active key list below.</p>
                            <code class="mt-2 block overflow-x-auto rounded-xl bg-white/80 px-3 py-2 text-xs dark:bg-slate-900/80">{{ session('plain_text_api_key') }}</code>
                        </div>
                        <button
                            type="button"
                            data-copy-value="{{ session('plain_text_api_key') }}"
                            class="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
                        >
                            Copy key
                        </button>
                    </div>
                </div>
            @endif

            <div class="grid gap-6 lg:grid-cols-3">
                <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
                    <div class="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p class="text-sm uppercase tracking-[0.2em] text-orange-500">Billing</p>
                            <h3 class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                {{ $plans[$currentPlanKey]['name'] ?? 'Free' }} plan
                            </h3>
                            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                {{ $plans[$currentPlanKey]['price_label'] ?? 'Free' }}
                                @if ($subscription && $subscription->valid())
                                    · Active subscription
                                @endif
                            </p>
                        </div>
                        <div class="rounded-2xl bg-slate-100 px-4 py-3 text-right dark:bg-slate-900">
                            <div class="text-xs uppercase tracking-[0.18em] text-slate-500">This month</div>
                            <div class="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{{ $monthlyUsage }}</div>
                            <div class="text-xs text-slate-500">credits used</div>
                        </div>
                    </div>

                    <div class="mt-6 grid gap-4 md:grid-cols-3">
                        @foreach ($plans as $planKey => $plan)
                            <div class="rounded-2xl border {{ $planKey === $currentPlanKey ? 'border-orange-400 bg-orange-50/60 dark:border-orange-500 dark:bg-orange-950/20' : 'border-slate-200 dark:border-slate-700' }} p-4">
                                <div class="flex items-center justify-between gap-3">
                                    <h4 class="text-lg font-semibold text-slate-900 dark:text-white">{{ $plan['name'] }}</h4>
                                    <span class="text-sm text-slate-500">{{ $plan['price_label'] }}</span>
                                </div>
                                <ul class="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                    @foreach ($plan['features'] as $feature)
                                        <li>{{ $feature }}</li>
                                    @endforeach
                                </ul>
                                <div class="mt-5">
                                    @if (($plan['billing_type'] ?? 'none') === 'stripe')
                                        <form method="POST" action="{{ route('billing.checkout', $planKey) }}">
                                            @csrf
                                            <button type="submit" class="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                                                {{ $subscription && $subscription->valid() ? 'Manage Billing' : 'Start Subscription' }}
                                            </button>
                                        </form>
                                    @elseif (($plan['billing_type'] ?? 'none') === 'contact')
                                        <a href="mailto:hello@figma2element.com?subject=Custom%20Plan" class="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200">
                                            Contact Sales
                                        </a>
                                    @else
                                        <span class="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                            Included
                                        </span>
                                    @endif
                                </div>
                            </div>
                        @endforeach
                    </div>

                    @if ($subscription && $subscription->valid())
                        <div class="mt-6">
                            <a href="{{ route('billing.portal') }}" class="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200">
                                Open Stripe Billing Portal
                            </a>
                        </div>
                    @endif
                </div>

                <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <p class="text-sm uppercase tracking-[0.2em] text-orange-500">API Keys</p>
                    <h3 class="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Plugin access</h3>
                    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {{ $activeApiKeyCount }}/2 active keys in use.
                        Revoke an active key before creating a third.
                    </p>
                    <form method="POST" action="{{ route('api-keys.store') }}" class="mt-5 space-y-3">
                        @csrf
                        <div>
                            <label for="name" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Key name</label>
                            <input id="name" name="name" type="text" required placeholder="Production plugin key" value="{{ old('name') }}" class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-orange-900" />
                        </div>
                        @error('name')
                            <p class="text-sm text-rose-600 dark:text-rose-400">{{ $message }}</p>
                        @enderror
                        @error('api_keys')
                            <p class="text-sm text-rose-600 dark:text-rose-400">{{ $message }}</p>
                        @enderror
                        <button
                            type="submit"
                            @disabled($activeApiKeyCount >= 2)
                            class="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition {{ $activeApiKeyCount >= 2 ? 'cursor-not-allowed bg-slate-400 dark:bg-slate-600' : 'bg-orange-500 hover:bg-orange-600' }}"
                        >
                            {{ $activeApiKeyCount >= 2 ? 'Two active keys already in use' : 'Create API key' }}
                        </button>
                    </form>

                    <div class="mt-6 space-y-3">
                        @forelse ($apiKeys as $apiKey)
                            <div class="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                                <div class="flex items-start justify-between gap-3">
                                    <div>
                                        <div class="font-medium text-slate-900 dark:text-white">{{ $apiKey->name }}</div>
                                        <div class="mt-1 text-xs text-slate-500">{{ $apiKey->key_prefix }}...</div>
                                        <div class="mt-1 text-xs text-slate-500">
                                            {{ $apiKey->revoked_at ? 'Revoked' : 'Active' }}
                                            @if ($apiKey->last_used_at)
                                                · last used {{ $apiKey->last_used_at->diffForHumans() }}
                                            @endif
                                        </div>
                                        <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                            @if ($apiKey->plain_text_key)
                                                Full key is available to copy from this dashboard.
                                            @else
                                                Legacy key cannot be copied because the original secret was never stored.
                                            @endif
                                        </div>
                                    </div>
                                    <div class="flex flex-col items-end gap-2">
                                        @if ($apiKey->plain_text_key)
                                            <button
                                                type="button"
                                                data-copy-value="{{ $apiKey->plain_text_key }}"
                                                class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200"
                                            >
                                                Copy key
                                            </button>
                                        @endif
                                        @if (! $apiKey->revoked_at)
                                            <form method="POST" action="{{ route('api-keys.destroy', $apiKey) }}">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400">
                                                    Revoke
                                                </button>
                                            </form>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        @empty
                            <p class="text-sm text-slate-500 dark:text-slate-400">No API keys created yet.</p>
                        @endforelse
                    </div>
                </div>
            </div>

            <div class="mt-6 grid gap-6 lg:grid-cols-2">
                <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <p class="text-sm uppercase tracking-[0.2em] text-orange-500">Plugin setup</p>
                    <h3 class="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Use the Laravel domain only</h3>
                    <div class="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                        <div>
                            <div class="font-medium text-slate-900 dark:text-white">Manifest</div>
                            <code class="mt-2 block overflow-x-auto rounded-xl bg-slate-100 px-3 py-2 text-xs dark:bg-slate-900">/Users/farshad.ghanzanfari/Documents/www/Figma2Element/apps/figma-plugin/manifest.json</code>
                        </div>
                        <div>
                            <div class="font-medium text-slate-900 dark:text-white">Endpoint</div>
                            <code class="mt-2 block overflow-x-auto rounded-xl bg-slate-100 px-3 py-2 text-xs dark:bg-slate-900">{{ $pluginEndpoint }}</code>
                        </div>
                        <ol class="space-y-2 pl-5 text-sm list-decimal">
                            <li>Create an API key here.</li>
                            <li>Paste the key into the Figma plugin.</li>
                            <li>Set the plugin endpoint to the value above.</li>
                            <li>Convert from Figma without leaving this account surface.</li>
                        </ol>
                    </div>
                </div>

                <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <p class="text-sm uppercase tracking-[0.2em] text-orange-500">Architecture</p>
                    <h3 class="mt-2 text-xl font-semibold text-slate-900 dark:text-white">What changed</h3>
                    <ul class="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                        <li>Users now register and manage billing here in Laravel.</li>
                        <li>The Figma plugin should call this domain’s <code>/api/convert</code> route.</li>
                        <li>The legacy Node app remains the internal converter service behind the proxy.</li>
                    </ul>
                </div>
            </div>

            <div class="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <p class="text-sm uppercase tracking-[0.2em] text-orange-500">Conversion Jobs</p>
                        <h3 class="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Recent exports</h3>
                    </div>
                </div>

                <div class="mt-5 overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                        <thead>
                            <tr class="text-left text-slate-500">
                                <th class="pb-3 pr-6 font-medium">Source</th>
                                <th class="pb-3 pr-6 font-medium">Status</th>
                                <th class="pb-3 pr-6 font-medium">Credits</th>
                                <th class="pb-3 pr-6 font-medium">Updated</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                            @forelse ($jobs as $job)
                                <tr>
                                    <td class="py-3 pr-6 text-slate-900 dark:text-white">{{ $job->source_name }}</td>
                                    <td class="py-3 pr-6 text-slate-600 dark:text-slate-300">{{ $job->status }}</td>
                                    <td class="py-3 pr-6 text-slate-600 dark:text-slate-300">{{ $job->credits_used }}</td>
                                    <td class="py-3 pr-6 text-slate-500">{{ $job->updated_at->diffForHumans() }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="py-4 text-slate-500 dark:text-slate-400">No conversion jobs recorded yet.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.querySelectorAll('[data-copy-value]').forEach(function (button) {
            button.addEventListener('click', async function () {
                const value = button.getAttribute('data-copy-value');
                const originalText = button.textContent.trim();

                if (! value) {
                    return;
                }

                try {
                    await navigator.clipboard.writeText(value);
                    button.textContent = 'Copied';
                } catch (error) {
                    button.textContent = 'Copy failed';
                }

                window.setTimeout(function () {
                    button.textContent = originalText;
                }, 1600);
            });
        });
    </script>
</x-app-layout>
