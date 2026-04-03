<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name') === 'Laravel' ? 'Figma2Element' : config('app.name', 'Figma2Element') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased">
        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(242,78,30,0.2),_transparent_30%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)] text-white">
            <div class="mx-auto grid min-h-screen max-w-6xl gap-10 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <section class="hidden lg:block">
                    <div class="max-w-xl">
                        <a href="{{ route('home') }}" class="inline-flex">
                            <x-application-logo class="w-auto" />
                        </a>
                        <p class="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-orange-400">Account access</p>
                        <h1 class="mt-4 text-5xl font-semibold tracking-tight text-white">
                            Manage billing, API keys, and Figma exports from one platform.
                        </h1>
                        <p class="mt-6 max-w-lg text-lg leading-8 text-slate-300">
                            The plugin, conversion API, and account dashboard now live under the same product surface. Sign in and continue from one place.
                        </p>
                        <div class="mt-10 grid gap-4 sm:grid-cols-3">
                            <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                                <div class="text-sm font-semibold text-white">Secure auth</div>
                                <p class="mt-2 text-sm text-slate-400">User registration, login, and password recovery.</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                                <div class="text-sm font-semibold text-white">API keys</div>
                                <p class="mt-2 text-sm text-slate-400">Issue plugin keys and track their usage from the dashboard.</p>
                            </div>
                            <div class="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                                <div class="text-sm font-semibold text-white">Conversion history</div>
                                <p class="mt-2 text-sm text-slate-400">Review exported jobs and connect billing to usage.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="w-full">
                    <div class="mx-auto w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-black/30 backdrop-blur">
                        <div class="lg:hidden">
                            <a href="{{ route('home') }}" class="inline-flex">
                                <x-application-logo class="w-auto" />
                            </a>
                        </div>
                        {{ $slot }}
                    </div>

                    <x-platform-footer class="mx-auto mt-6 max-w-lg" />
                </section>
            </div>
        </div>
    </body>
</html>
