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
                        <div class="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">
                            Community pricing
                            <span class="rounded-full bg-orange-500/20 px-2 py-1 text-[11px] tracking-[0.18em] text-orange-200">Join early, pay less</span>
                        </div>
                        <h1 class="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                            The first 100 users join free. Each new milestone raises pricing for later adopters, not for early ones.
                        </h1>
                        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                            Figma2Element is priced like a growing product community. Early adopters get in at zero or near-zero pricing,
                            and as total platform users grow, the public entry price climbs gradually until it caps at $14/month.
                        </p>
                        <div class="mt-8 flex flex-wrap gap-3">
                            @auth
                                <a href="{{ route('dashboard') }}" class="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400">Open dashboard</a>
                            @else
                                <a href="{{ route('register') }}" class="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400">Join the first cohorts</a>
                                <a href="{{ route('login') }}" class="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/30 hover:bg-white/10">Sign in</a>
                            @endauth
                        </div>
                        <div class="mt-10 grid gap-4 sm:grid-cols-3">
                            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div class="text-sm font-semibold text-white">Founders band</div>
                                <p class="mt-2 text-sm text-slate-400">The first 100 total users get the platform free while the product community forms.</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div class="text-sm font-semibold text-white">Gradual milestones</div>
                                <p class="mt-2 text-sm text-slate-400">$1, $3, $6, then $9 as the public user count climbs through the early bands.</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div class="text-sm font-semibold text-white">Price ceiling</div>
                                <p class="mt-2 text-sm text-slate-400">After the platform matures, pricing stops rising and stays capped at $14/month.</p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <div class="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">Why it works</div>
                            <ol class="mt-5 space-y-4 text-sm text-slate-300">
                                <li>1. Early adopters are rewarded instead of paying enterprise pricing on day one.</li>
                                <li>2. Public pricing rises only when the community grows, making the product feel alive.</li>
                                <li>3. Everyone sees the same published milestones, so the model stays easy to trust.</li>
                                <li>4. The ceiling is fixed, so later users still know the maximum cost upfront.</li>
                            </ol>
                        </div>
                        <div class="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div class="flex items-center justify-between gap-3">
                                <div class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">Community milestones</div>
                                <a href="{{ route('docs') }}#plan-limits-usage" class="text-xs font-medium text-slate-400 transition hover:text-white">See full policy</a>
                            </div>
                            <div class="mt-5 space-y-3 text-sm text-slate-300">
                                @foreach ($featuredBands as $band)
                                    <div class="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                                        <div class="flex items-start justify-between gap-4">
                                            <div>
                                                <div class="text-sm font-semibold text-white">{{ $band['name'] }}</div>
                                                <div class="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                                                    Total users
                                                    @if (($band['end_users'] ?? null) !== null)
                                                        {{ number_format($band['start_users']) }}-{{ number_format($band['end_users']) }}
                                                    @else
                                                        {{ number_format($band['start_users']) }}+
                                                    @endif
                                                </div>
                                            </div>
                                            <div class="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-200">
                                                {{ $band['price_label'] }}
                                            </div>
                                        </div>
                                        <p class="mt-3 text-sm leading-6 text-slate-400">{{ $band['summary'] }}</p>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </section>

                <section class="mt-12 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
                    <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                        <div>
                            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">How to use the platform</p>
                            <h2 class="mt-4 text-3xl font-semibold tracking-tight text-white">Join the community early, then convert from the same account surface.</h2>
                            <p class="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                                Sign up, create an API key, connect the Figma plugin, and export Elementor-ready templates. The pricing story now belongs on the homepage because it is part of the product value, not a billing footnote.
                            </p>
                        </div>
                        <div class="grid gap-4 sm:grid-cols-2">
                            <div class="rounded-2xl border border-white/10 bg-black/20 p-5">
                                <div class="text-sm font-semibold text-white">1. Join your band</div>
                                <p class="mt-2 text-sm leading-6 text-slate-400">Create an account while the community is still early and lock in the current public price milestone.</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-black/20 p-5">
                                <div class="text-sm font-semibold text-white">2. Connect Figma</div>
                                <p class="mt-2 text-sm leading-6 text-slate-400">Use the plugin with your API key so Figma exports route through the same platform account.</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-black/20 p-5">
                                <div class="text-sm font-semibold text-white">3. Convert for Elementor</div>
                                <p class="mt-2 text-sm leading-6 text-slate-400">Generate template JSON, track export history, and import into Elementor or your WordPress plugin flow.</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-black/20 p-5">
                                <div class="text-sm font-semibold text-white">4. Grow with the app</div>
                                <p class="mt-2 text-sm leading-6 text-slate-400">As more users join, new cohorts move into the next band, reinforcing momentum without punishing earlier adopters.</p>
                            </div>
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
