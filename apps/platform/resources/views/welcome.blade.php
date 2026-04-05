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
            $featuredBands = array_slice($adoptionBands, 0, 5);
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

                <section class="mt-12 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
                    <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                        <div>
                            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">Founders giveaway</p>
                            <h2 class="mt-4 text-3xl font-semibold tracking-tight text-white">The first 100 platform users join free.</h2>
                            <p class="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                                This is the public incentive for early adopters. As total users grow, the entry price for new signups moves through
                                published milestones, but the first cohort gets the lowest possible starting point.
                            </p>
                            <a href="{{ route('docs') }}#plan-limits-usage" class="mt-5 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">See the full milestone model</a>
                        </div>
                        <div class="grid gap-4 sm:grid-cols-2">
                            @foreach ($featuredBands as $band)
                                <div class="rounded-2xl border border-white/10 bg-black/20 p-5">
                                    <div class="flex items-center justify-between gap-3">
                                        <div class="text-sm font-semibold text-white">{{ $band['name'] }}</div>
                                        <div class="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">{{ $band['price_label'] }}</div>
                                    </div>
                                    <p class="mt-2 text-sm leading-6 text-slate-400">
                                        @if (($band['end_users'] ?? null) !== null)
                                            Users {{ number_format($band['start_users']) }}-{{ number_format($band['end_users']) }}.
                                        @else
                                            Users {{ number_format($band['start_users']) }}+.
                                        @endif
                                        {{ $band['summary'] }}
                                    </p>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </section>
            </main>

            <div class="mx-auto max-w-6xl px-6 pb-8">
                <x-platform-footer class="border-t border-white/10 pt-6" />
            </div>
        </div>
    </body>
</html>
