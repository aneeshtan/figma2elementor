<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name') === 'Laravel' ? 'Figma2Element' : config('app.name', 'Figma2Element') }}</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="bg-slate-950 text-white">
        @php
            $adoptionBands = config('figma2element.adoption_bands', []);
            $sliderBands = array_slice($adoptionBands, 0, 6);
            $sliderMaxUsers = 10000;
            try {
                $currentUsers = \App\Models\User::query()->count();
            } catch (\Throwable) {
                $currentUsers = 0;
            }
            $clampedUsers = max(0, min($currentUsers, $sliderMaxUsers));
            $sliderPercent = $sliderMaxUsers > 0 ? round(($clampedUsers / $sliderMaxUsers) * 100, 2) : 0;
            $currentBand = collect($adoptionBands)->first(function (array $band) use ($currentUsers) {
                $endUsers = $band['end_users'] ?? null;

                return $currentUsers >= $band['start_users']
                    && ($endUsers === null || $currentUsers <= $endUsers);
            }) ?? ($adoptionBands[0] ?? null);
            $sliderStops = collect($sliderBands)->values()->map(function (array $band, int $index) use ($sliderBands) {
                $lastIndex = max(count($sliderBands) - 1, 1);
                $position = $lastIndex > 0 ? ($index / $lastIndex) * 100 : 0;

                return $band + ['visual_position' => $position];
            })->all();
            $currentBandIndex = collect($sliderStops)->search(fn (array $band) => ($band['id'] ?? null) === ($currentBand['id'] ?? null));
            $currentBandIndex = $currentBandIndex === false ? 0 : $currentBandIndex;
            $bandStartPosition = $sliderStops[$currentBandIndex]['visual_position'] ?? 0;
            $bandEndPosition = $sliderStops[min($currentBandIndex + 1, count($sliderStops) - 1)]['visual_position'] ?? 100;
            $bandStartUsers = $currentBand['start_users'] ?? 0;
            $bandEndUsers = $currentBand['end_users'] ?? $sliderMaxUsers;
            $bandUserSpan = max(($bandEndUsers - $bandStartUsers), 1);
            $bandProgress = min(max(($currentUsers - $bandStartUsers) / $bandUserSpan, 0), 1);
            $visualSliderPercent = $bandStartPosition + (($bandEndPosition - $bandStartPosition) * $bandProgress);
            $visualSliderPercent = min(max($visualSliderPercent, 2), 98);
        @endphp
        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(242,78,30,0.18),_transparent_35%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]">
            <header class="mx-auto max-w-6xl px-6 py-6">
                <nav class="flex items-center justify-between gap-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
                    <div class="flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-sm font-bold">F2E</div>
                        <div>
                            <div class="text-sm font-semibold">Figma2Element</div>
                            <div class="text-xs text-slate-400">Figma to Elementor</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <a href="{{ route('docs') }}" class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">Docs</a>
                        @auth
                            <a href="{{ route('dashboard') }}" class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">Dashboard</a>
                        @else
                            <a href="{{ route('login') }}" class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">Login</a>
                            <a href="{{ route('register') }}" class="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400">Get started</a>
                        @endauth
                    </div>
                </nav>
            </header>

            <main class="mx-auto max-w-6xl px-6 pb-20 pt-10">
                <section class="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                    <div class="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
                        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-orange-400">Figma to Elementor</p>
                        <h1 class="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                            Convert Figma sections into Elementor-ready templates from the same platform.
                        </h1>
                        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                            Connect the Figma plugin, generate conversion JSON, manage exports, and run the workflow from one account surface.
                            Figma2Element handles auth, dashboard, API keys, and the public conversion endpoint in one place.
                        </p>
                        <div class="mt-8 flex flex-wrap gap-3">
                            @auth
                                <a href="{{ route('dashboard') }}" class="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400">Open dashboard</a>
                            @else
                                <a href="{{ route('register') }}" class="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400">Create account</a>
                                <a href="{{ route('login') }}" class="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/30 hover:bg-white/10">Sign in</a>
                            @endauth
                        </div>
                        <div class="mt-10 grid gap-4 sm:grid-cols-3">
                            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div class="text-sm font-semibold text-white">Plugin workflow</div>
                                <p class="mt-2 text-sm text-slate-400">Convert from Figma with your API key and send exports to the same account.</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div class="text-sm font-semibold text-white">Saved exports</div>
                                <p class="mt-2 text-sm text-slate-400">Keep API keys, conversion jobs, and downloadable JSON in one dashboard.</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div class="text-sm font-semibold text-white">WordPress import</div>
                                <p class="mt-2 text-sm text-slate-400">Use the WordPress plugin or direct JSON import to finish the Elementor flow.</p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <div class="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">Flow</div>
                            <ol class="mt-5 space-y-4 text-sm text-slate-300">
                                <li>1. Register or sign in.</li>
                                <li>2. Create an API key in the dashboard.</li>
                                <li>3. Connect the Figma plugin.</li>
                                <li>4. Convert the selected frame or section.</li>
                                <li>5. Import the JSON into Elementor or WordPress.</li>
                            </ol>
                        </div>
                        <div class="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">Platform</div>
                            <div class="mt-5 space-y-3 text-sm text-slate-300">
                                <div class="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Public app: Laravel platform</div>
                                <div class="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Converter engine: internal rendering service</div>
                                <div class="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Design entry: Figma plugin</div>
                                <div class="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Import target: Elementor / WordPress</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.96),rgba(17,24,39,0.9))] p-8 shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur">
                    <div class="border-b border-white/10 pb-8">
                        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">Founders giveaway</p>
                        <div class="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 class="text-3xl font-semibold tracking-tight text-white">Adoption-based pricing that gets hotter as the community grows.</h2>
                                <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                                    Early users get the lowest entry point. As total platform users climb, the public entry price moves through clear milestones.
                                    Hover the tags to preview each pricing checkpoint.
                                </p>
                            </div>
                            <a href="{{ route('docs') }}#plan-limits-usage" class="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">See the full milestone model</a>
                        </div>
                    </div>

                    <div class="grid gap-10 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                        <div class="rounded-[1.75rem] border border-emerald-400/12 bg-[linear-gradient(180deg,rgba(240,253,244,0.04),rgba(2,6,23,0.18))] p-6">
                            <div class="text-center">
                                <div class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">Total platform users</div>
                                <div class="mt-3 text-4xl font-semibold tracking-tight text-white">{{ number_format($currentUsers) }}</div>
                            </div>

                            <div class="relative mt-10 px-4 pt-12 pb-20 sm:px-8 sm:pt-14">
                                <div class="absolute inset-x-4 top-[4.75rem] h-3 rounded-full bg-white/10 sm:inset-x-8"></div>
                                <div class="absolute inset-x-4 top-[4.75rem] h-3 rounded-full bg-[linear-gradient(90deg,#65a30d_0%,#84cc16_16%,#22c55e_36%,#facc15_58%,#fb923c_78%,#ef4444_100%)] shadow-[0_0_35px_rgba(34,197,94,0.22)] sm:inset-x-8"></div>
                                <div
                                    class="absolute top-[3.6rem] h-8 w-8 -translate-x-1/2 rounded-full border-4 border-white bg-emerald-600 shadow-[0_0_0_6px_rgba(34,197,94,0.18),0_14px_35px_rgba(22,101,52,0.45)] transition-[left] duration-[1800ms] ease-out"
                                    data-slider-thumb
                                    style="left: 0%"
                                    data-target-left="{{ $visualSliderPercent }}%"
                                ></div>
                                <div
                                    class="absolute top-0 -translate-x-1/2 rounded-2xl border border-emerald-400/20 bg-slate-950/95 px-4 py-3 text-center shadow-[0_12px_32px_rgba(2,6,23,0.45)] transition-[left] duration-[1800ms] ease-out"
                                    data-slider-badge
                                    style="left: 0%"
                                    data-target-left="{{ $visualSliderPercent }}%"
                                >
                                    <div class="text-[10px] uppercase tracking-[0.22em] text-slate-500">Current usage</div>
                                    <div class="mt-1 text-sm font-semibold text-white">{{ number_format($currentUsers) }} users</div>
                                    <div class="mt-1 text-xs font-medium text-emerald-300">{{ $currentBand['price_label'] ?? 'Free' }}</div>
                                </div>

                                @foreach ($sliderStops as $index => $band)
                                    @php
                                        $stopUsers = $band['end_users'] ?? $sliderMaxUsers;
                                        $stopPercent = $band['visual_position'];
                                        $alignClass = $index === 0 ? 'left-0 translate-x-0' : ($index === count($sliderStops) - 1 ? 'right-0 translate-x-0' : 'left-1/2 -translate-x-1/2');
                                        $tooltipAlignClass = $index === 0 ? 'left-0' : ($index === count($sliderStops) - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2');
                                    @endphp
                                    <div class="absolute top-[3.85rem] h-6 w-px bg-white/25" style="left: {{ $stopPercent }}%"></div>
                                    <div class="group absolute top-[2.7rem] -translate-y-full" style="left: {{ $stopPercent }}%">
                                        <div class="relative {{ $alignClass }}">
                                            <button type="button" class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-[0_10px_25px_rgba(2,6,23,0.3)] transition hover:border-emerald-300/40 hover:bg-slate-900">
                                                <span>{{ $band['price_label'] }}</span>
                                                <span class="text-slate-500">{{ number_format($stopUsers) }}</span>
                                            </button>
                                            <div class="pointer-events-none absolute top-full z-10 mt-3 w-44 rounded-2xl border border-white/10 bg-slate-950/95 p-3 text-left opacity-0 shadow-[0_18px_40px_rgba(2,6,23,0.45)] transition duration-200 group-hover:opacity-100 {{ $tooltipAlignClass }}">
                                                <div class="text-[10px] uppercase tracking-[0.22em] text-slate-500">{{ $band['name'] }}</div>
                                                <div class="mt-1 text-sm font-semibold text-white">{{ $band['price_label'] }}</div>
                                                <div class="mt-1 text-xs leading-5 text-slate-400">
                                                    Up to {{ number_format($stopUsers) }} total users.
                                                    {{ $band['summary'] }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach

                                <div class="mt-24 flex items-center justify-between text-xs font-medium text-slate-500">
                                    <span>0 users</span>
                                    <span>10,000+ users</span>
                                </div>
                            </div>
                        </div>

                        <div class="grid gap-6 rounded-[1.75rem] border border-white/10 bg-black/20 p-6 lg:grid-cols-1">
                            <div class="rounded-[1.5rem] border border-emerald-400/15 bg-[linear-gradient(135deg,rgba(34,197,94,0.12),rgba(15,23,42,0.1))] p-6">
                                <div class="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">Current entry price</div>
                                <div class="mt-4 flex items-end gap-2">
                                    <div class="text-6xl font-semibold tracking-tight text-emerald-400">
                                        {{ $currentBand['price_label'] === 'Free' ? '0' : preg_replace('/[^0-9]/', '', $currentBand['price_label'] ?? '0') }}
                                    </div>
                                    <div class="pb-2 text-2xl font-medium text-emerald-300">
                                        {{ $currentBand['price_label'] === 'Free' ? '/mo' : '/mo' }}
                                    </div>
                                </div>
                                <div class="mt-4 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                                    {{ $currentBand['name'] ?? 'Founders' }} band
                                </div>
                            </div>
                            <div class="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
                                <p class="text-lg font-semibold text-white">Early adopters lock in the lowest public price.</p>
                                <p class="mt-3 text-sm leading-7 text-slate-300">
                                    The first 100 users join free, then the public entry price steps through clearly published milestones. The track above shows where the community is now and what later users will pay as adoption grows.
                                </p>
                                <div class="mt-5 flex flex-wrap gap-3">
                                    <div class="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">{{ number_format($currentUsers) }} total users</div>
                                    <div class="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">{{ $currentBand['price_label'] ?? 'Free' }} current entry</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <div class="mx-auto max-w-6xl px-6 pb-8">
                <x-platform-footer class="border-t border-white/10 pt-6" />
            </div>
        </div>
        <script>
            window.addEventListener('DOMContentLoaded', () => {
                const fill = document.querySelector('[data-slider-fill]');
                const thumbs = document.querySelectorAll('[data-slider-thumb]');
                const badges = document.querySelectorAll('[data-slider-badge]');

                if (fill) {
                    window.requestAnimationFrame(() => {
                        fill.style.width = fill.dataset.targetWidth || '0%';
                    });
                }

                thumbs.forEach((thumb) => {
                    window.requestAnimationFrame(() => {
                        thumb.style.left = thumb.dataset.targetLeft || '0%';
                    });
                });

                badges.forEach((badge) => {
                    window.requestAnimationFrame(() => {
                        badge.style.left = badge.dataset.targetLeft || '0%';
                    });
                });
            });
        </script>
    </body>
</html>
