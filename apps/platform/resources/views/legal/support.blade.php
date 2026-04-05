<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Support | Figma2Element</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="bg-slate-950 text-white">
        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(242,78,30,0.16),_transparent_35%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]">
            <header class="mx-auto max-w-5xl px-6 py-6">
                <nav class="flex items-center justify-between gap-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
                    <div class="flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-sm font-bold">F2E</div>
                        <div>
                            <div class="text-sm font-semibold">Figma2Element</div>
                            <div class="text-xs text-slate-400">Support</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <a href="{{ route('home') }}" class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">Home</a>
                        <a href="{{ route('docs') }}" class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">Docs</a>
                        <a href="{{ route('privacy') }}" class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">Privacy</a>
                    </div>
                </nav>
            </header>

            <main class="mx-auto max-w-4xl px-6 pb-20 pt-6">
                <article class="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
                    <p class="text-sm font-semibold uppercase tracking-[0.24em] text-orange-400">Support</p>
                    <h1 class="mt-4 text-4xl font-semibold tracking-tight text-white">How to get help</h1>
                    <p class="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                        Use these channels when you need help with the Figma plugin, export fidelity, import issues, API keys, or account access.
                    </p>

                    <section class="mt-10 grid gap-5 md:grid-cols-2">
                        <div class="rounded-3xl border border-white/10 bg-black/20 p-6">
                            <h2 class="text-lg font-semibold text-white">Product support</h2>
                            <p class="mt-3 text-sm leading-7 text-slate-300">
                                Contact the team at <a class="text-orange-300 hover:text-orange-200" href="mailto:support@figma2elementor.ctrlaltl.com">support@figma2elementor.ctrlaltl.com</a>.
                            </p>
                        </div>
                        <div class="rounded-3xl border border-white/10 bg-black/20 p-6">
                            <h2 class="text-lg font-semibold text-white">Public issue tracking</h2>
                            <p class="mt-3 text-sm leading-7 text-slate-300">
                                Report reproducible bugs or feature requests on <a class="text-orange-300 hover:text-orange-200" href="https://github.com/aneeshtan/figma2elementor/issues" target="_blank" rel="noreferrer">GitHub Issues</a>.
                            </p>
                        </div>
                    </section>

                    <section class="mt-10 space-y-4 text-sm leading-7 text-slate-300">
                        <h2 class="text-lg font-semibold text-white">Best support payload</h2>
                        <p>When reporting a conversion problem, include the Figma screenshot, the exported JSON, the Elementor result, and a note about whether Elementor Pro is active.</p>
                        <p>For plugin review questions, include the plugin version shown in the plugin header and the endpoint being used.</p>
                    </section>
                </article>
            </main>

            <div class="mx-auto max-w-4xl px-6 pb-8">
                <x-platform-footer class="border-t border-white/10 pt-6" />
            </div>
        </div>
    </body>
</html>
