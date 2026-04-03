<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name') === 'Laravel' ? 'Figma2Element' : config('app.name', 'Figma2Element') }}</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="bg-slate-950 text-white">
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
                        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-orange-400">One app now</p>
                        <h1 class="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                            Register, generate an API key, and convert Figma selections from the same platform.
                        </h1>
                        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                            The old split is gone at the user level. Laravel now handles landing, auth, billing, dashboard, and the public
                            conversion endpoint. The Node converter stays behind the scenes as the internal rendering service.
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
                                <div class="text-sm font-semibold text-white">Auth + billing</div>
                                <p class="mt-2 text-sm text-slate-400">Laravel Breeze and Stripe Cashier run the account lifecycle.</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div class="text-sm font-semibold text-white">Plugin endpoint</div>
                                <p class="mt-2 text-sm text-slate-400">The Figma plugin can now target this domain’s <code>/api/convert</code>.</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div class="text-sm font-semibold text-white">Saved usage</div>
                                <p class="mt-2 text-sm text-slate-400">API keys and conversion jobs live in the same platform account.</p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <div class="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">Flow</div>
                            <ol class="mt-5 space-y-4 text-sm text-slate-300">
                                <li>1. Register or sign in.</li>
                                <li>2. Create an API key in the dashboard.</li>
                                <li>3. Import the Figma plugin manifest.</li>
                                <li>4. Set the plugin endpoint to this app’s <code>/api/convert</code>.</li>
                                <li>5. Convert and import the JSON into Elementor.</li>
                            </ol>
                        </div>
                        <div class="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                            <div class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">Current stack</div>
                            <div class="mt-5 space-y-3 text-sm text-slate-300">
                                <div class="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Public app: Laravel platform</div>
                                <div class="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Converter engine: internal Node service</div>
                                <div class="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Design entry: Figma plugin</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </body>
</html>
