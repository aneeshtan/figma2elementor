<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Privacy | Figma2Element</title>
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
                            <div class="text-xs text-slate-400">Privacy</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <a href="{{ route('home') }}" class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">Home</a>
                        <a href="{{ route('docs') }}" class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">Docs</a>
                        <a href="{{ route('support') }}" class="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400">Support</a>
                    </div>
                </nav>
            </header>

            <main class="mx-auto max-w-4xl px-6 pb-20 pt-6">
                <article class="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
                    <p class="text-sm font-semibold uppercase tracking-[0.24em] text-orange-400">Privacy</p>
                    <h1 class="mt-4 text-4xl font-semibold tracking-tight text-white">How the Figma plugin handles data</h1>
                    <p class="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                        Figma2Element sends only the data required to convert a selected Figma section into Elementor JSON. The plugin works with
                        your Figma2Element account and calls the hosted API at <code>https://f2e.ctrlaltl.com/api/convert</code>.
                    </p>

                    <section class="mt-10 space-y-6 text-sm leading-7 text-slate-300">
                        <div>
                            <h2 class="text-lg font-semibold text-white">What is sent</h2>
                            <p class="mt-2">
                                The plugin sends the currently selected layer structure, metadata such as names, geometry, layout, text styles,
                                effect information, and exported image data for layers that must be rasterized for conversion.
                            </p>
                        </div>

                        <div>
                            <h2 class="text-lg font-semibold text-white">What is not sent by default</h2>
                            <p class="mt-2">
                                The plugin does not upload your whole Figma file. It only serializes the active selection and the assets directly
                                required to build the export payload for that selection.
                            </p>
                        </div>

                        <div>
                            <h2 class="text-lg font-semibold text-white">API keys</h2>
                            <p class="mt-2">
                                Your API key is stored locally in Figma plugin client storage so you do not need to paste it every time. You can
                                remove it at any time using the <strong>Forget saved key</strong> action in the plugin UI.
                            </p>
                        </div>

                        <div>
                            <h2 class="text-lg font-semibold text-white">Exports and job history</h2>
                            <p class="mt-2">
                                Successful conversions may be stored in your Figma2Element account as export jobs so you can download them again
                                from the dashboard or sync them through the WordPress importer workflow.
                            </p>
                        </div>

                        <div>
                            <h2 class="text-lg font-semibold text-white">Questions</h2>
                            <p class="mt-2">
                                If you need clarification before using the plugin, visit the <a class="text-orange-300 hover:text-orange-200" href="{{ route('support') }}">Support page</a>.
                            </p>
                        </div>
                    </section>
                </article>
            </main>

            <div class="mx-auto max-w-4xl px-6 pb-8">
                <x-platform-footer class="border-t border-white/10 pt-6" />
            </div>
        </div>
    </body>
</html>
