<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Documentation | Figma2Element</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="bg-slate-950 text-white">
        @php
            $sections = [
                ['id' => 'overview', 'label' => 'Overview'],
                ['id' => 'quick-start', 'label' => 'Quick Start'],
                ['id' => 'api-keys', 'label' => 'API Keys & Endpoint'],
                ['id' => 'plugin-flow', 'label' => 'Figma Plugin'],
                ['id' => 'wordpress-plugin', 'label' => 'WordPress Plugin'],
                ['id' => 'usage', 'label' => 'Plan Limits & Usage'],
                ['id' => 'troubleshooting', 'label' => 'Troubleshooting'],
                ['id' => 'best-practices', 'label' => 'Best Practices'],
                ['id' => 'resources', 'label' => 'More Resources'],
                ['id' => 'help', 'label' => 'Need Help?'],
            ];
        @endphp

        <div class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(242,78,30,0.14),_transparent_32%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]">
            <header class="mx-auto max-w-7xl px-6 py-6">
                <nav class="flex items-center justify-between gap-6 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
                    <div class="flex items-center gap-3">
                        <a href="{{ route('home') }}" class="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-sm font-bold">F2E</a>
                        <div>
                            <div class="text-sm font-semibold">Figma2Element</div>
                            <div class="text-xs text-slate-400">Public Documentation</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <a href="{{ route('home') }}" class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">Home</a>
                        @auth
                            <a href="{{ route('dashboard') }}" class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">Dashboard</a>
                        @else
                            <a href="{{ route('login') }}" class="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10">Login</a>
                            <a href="{{ route('register') }}" class="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400">Get started</a>
                        @endauth
                    </div>
                </nav>
            </header>

            <main class="mx-auto max-w-7xl px-6 pb-20 pt-6">
                <section class="flex flex-col gap-8 md:flex-row md:items-start">
                    <aside class="md:sticky md:top-6 md:w-72 md:shrink-0 md:self-start">
                        <div class="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/90 backdrop-blur md:max-h-[calc(100vh-3rem)] md:overflow-y-auto">
                            <div class="border-b border-white/10 px-5 py-5">
                                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-orange-400">Documentation</p>
                                <h1 class="mt-3 text-2xl font-semibold tracking-tight text-white">Figma2Element Docs</h1>
                                <p class="mt-3 text-sm leading-7 text-slate-400">Install, connect, export, import, troubleshoot, and improve match quality.</p>
                            </div>
                            <div class="px-5 py-5">
                                <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">Version</div>
                                <div class="mt-2 text-sm font-semibold text-white">v0.4.0</div>
                                <div class="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">Last Updated</div>
                                <div class="mt-2 text-sm text-slate-300">April 3, 2026</div>
                            </div>
                            <div class="border-t border-white/10 px-3 py-3">
                                <nav class="space-y-1">
                                    @foreach ($sections as $section)
                                        <a href="#{{ $section['id'] }}" class="block rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
                                            {{ $section['label'] }}
                                        </a>
                                    @endforeach
                                </nav>
                            </div>
                            <div class="border-t border-white/10 px-5 py-5">
                                <a href="https://github.com/aneeshtan/figma2elementor/issues" class="inline-flex w-full items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/30 hover:bg-white/10">Report issue</a>
                            </div>
                        </div>
                    </aside>

                    <div class="min-w-0 flex-1 space-y-6 md:max-w-4xl">
                        <section class="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-8 shadow-2xl shadow-black/20 backdrop-blur">
                            <p class="text-sm font-semibold uppercase tracking-[0.24em] text-orange-400">Public Guide</p>
                            <h2 class="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                Everything you need to install, connect, export, import, and troubleshoot Figma2Element.
                            </h2>
                            <p class="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                                This guide covers the full Figma2Element workflow: platform account setup, API keys, Figma exports,
                                WordPress imports, usage limits, best practices, and recovery paths when something breaks.
                            </p>
                            <div class="mt-7 flex flex-wrap gap-3">
                                <a href="#quick-start" class="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400">Start here</a>
                                <a href="#troubleshooting" class="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/30 hover:bg-white/10">Troubleshooting</a>
                            </div>
                        </section>

                        <section id="overview" class="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-7 backdrop-blur">
                            <h2 class="text-2xl font-semibold text-white">Overview</h2>
                            <p class="mt-4 text-base leading-8 text-slate-300">
                                Figma2Element is a complete conversion workflow for turning structured Figma sections into Elementor-ready
                                templates. The product currently consists of three public-facing parts.
                            </p>
                            <div class="mt-6 grid gap-4 md:grid-cols-3">
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-300">Figma Plugin</div>
                                    <p class="mt-3 text-sm leading-7 text-slate-300">Serializes the selected Figma frame, exports assets, and sends the payload to your platform API.</p>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-300">Platform App</div>
                                    <p class="mt-3 text-sm leading-7 text-slate-300">Handles signup, billing, API keys, job history, downloads, and the public conversion endpoint.</p>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold uppercase tracking-[0.22em] text-orange-300">WordPress Plugin</div>
                                    <p class="mt-3 text-sm leading-7 text-slate-300">Fetches completed jobs, sideloads exported assets into media, and inserts the template into Elementor.</p>
                                </div>
                            </div>
                            <div class="mt-6 rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5 text-sm leading-7 text-orange-50">
                                Figma2Element performs best when your designs are export-friendly: auto layout where possible, clearly structured frames, and explicit naming for interactive or complex widgets.
                            </div>
                        </section>

                        <section id="quick-start" class="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-7 backdrop-blur">
                            <h2 class="text-2xl font-semibold text-white">Quick Start</h2>
                            <div class="mt-6 grid gap-4 md:grid-cols-3">
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">1. Create & connect</div>
                                    <ul class="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                                        <li>Create your Figma2Element account.</li>
                                        <li>Generate an API key from the dashboard.</li>
                                        <li>Keep the platform URL handy for both plugins.</li>
                                    </ul>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">2. Export from Figma</div>
                                    <ul class="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                                        <li>Select a top-level frame or exportable section.</li>
                                        <li>Open the Figma2Element plugin.</li>
                                        <li>Paste the API key and convert the selected frame.</li>
                                    </ul>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">3. Import into WordPress</div>
                                    <ul class="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                                        <li>Install the Figma2Element WordPress companion plugin.</li>
                                        <li>Connect it using the same platform URL and API key.</li>
                                        <li>Choose a completed job and import it into Elementor.</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                                <div class="text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">Typical endpoint</div>
                                <pre class="mt-3 overflow-x-auto text-sm leading-7 text-slate-200"><code>https://your-domain.com/api/convert</code></pre>
                            </div>
                        </section>

                        <section id="api-keys" class="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-7 backdrop-blur">
                            <h2 class="text-2xl font-semibold text-white">API Keys & Endpoint</h2>
                            <p class="mt-4 text-base leading-8 text-slate-300">
                                Your API key connects the platform, Figma plugin, and WordPress plugin. It authorizes exports, lets the
                                WordPress plugin list completed jobs, and allows secure template downloads.
                            </p>
                            <ol class="mt-5 space-y-3 text-sm leading-7 text-slate-300">
                                <li>1. Sign in to your Figma2Element dashboard.</li>
                                <li>2. Create a new API key and copy it immediately.</li>
                                <li>3. Use that same key in the Figma plugin and WordPress importer.</li>
                                <li>4. Point both plugins at your public Laravel app, not the internal Node service.</li>
                            </ol>
                            <div class="mt-6 grid gap-4 md:grid-cols-2">
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">Figma endpoint</div>
                                    <pre class="mt-3 overflow-x-auto text-sm leading-7 text-slate-200"><code>POST /api/convert</code></pre>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">WordPress job sync</div>
                                    <pre class="mt-3 overflow-x-auto text-sm leading-7 text-slate-200"><code>GET /api/jobs
GET /api/jobs/{id}/download</code></pre>
                                </div>
                            </div>
                            <div class="mt-6 rounded-3xl border border-red-500/25 bg-red-500/10 p-5 text-sm leading-7 text-red-50">
                                Keep your API key private. If it leaks, revoke it from the dashboard and issue a new one immediately.
                            </div>
                        </section>

                        <section id="plugin-flow" class="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-7 backdrop-blur">
                            <h2 class="text-2xl font-semibold text-white">Figma Plugin</h2>
                            <div class="mt-4 space-y-5 text-sm leading-7 text-slate-300">
                                <p>Use the plugin to export selected sections from Figma to your Figma2Element platform.</p>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Install & connect</div>
                                    <ol class="mt-3 space-y-2">
                                        <li>1. Import the development manifest or install the published plugin.</li>
                                        <li>2. Paste your public API endpoint.</li>
                                        <li>3. Paste your platform API key.</li>
                                        <li>4. Select a single exportable frame and click Convert.</li>
                                    </ol>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                                    <div class="text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">Strict naming examples</div>
                                    <pre class="mt-3 overflow-x-auto text-sm leading-7 text-slate-200"><code>el-nav:Header
el-form:Get a Quote
el-feature-grid:Offerings
el-slider:Related Offerings
hide:mobile
stack:tablet
motion:autoplay</code></pre>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">What the plugin exports</div>
                                    <ul class="mt-3 space-y-2">
                                        <li>Structured node tree, layout, spacing, text, fills, strokes, shadows, corner radii, and images</li>
                                        <li>Interaction-aware hints for sliders, buttons, tabs, accordions, and hover states</li>
                                        <li>Responsive naming tokens like <code>hide:tablet</code> and <code>stack:mobile</code></li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section id="wordpress-plugin" class="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-7 backdrop-blur">
                            <h2 class="text-2xl font-semibold text-white">WordPress Plugin</h2>
                            <p class="mt-4 text-base leading-8 text-slate-300">
                                The WordPress companion plugin pulls completed jobs from the platform and imports them into Elementor.
                            </p>
                            <div class="mt-6 grid gap-4 md:grid-cols-2">
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Setup</div>
                                    <ol class="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                                        <li>1. Copy the plugin into <code>wp-content/plugins</code>.</li>
                                        <li>2. Activate <code>Figma2Elementor Importer</code>.</li>
                                        <li>3. Open <code>Tools → Figma2Elementor</code>.</li>
                                        <li>4. Save your platform URL and API key.</li>
                                    </ol>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Import flow</div>
                                    <ol class="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                                        <li>1. Choose a completed job from the admin screen.</li>
                                        <li>2. The plugin downloads the Elementor JSON export.</li>
                                        <li>3. Remote image URLs are sideloaded into local media.</li>
                                        <li>4. An <code>elementor_library</code> template is created automatically.</li>
                                    </ol>
                                </div>
                            </div>
                            <div class="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-sm leading-7 text-slate-300">
                                Elementor must be installed and active before imports can be created.
                            </div>
                        </section>

                        <section id="usage" class="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-7 backdrop-blur">
                            <h2 class="text-2xl font-semibold text-white">Plan Limits & Usage</h2>
                            <p class="mt-4 text-base leading-8 text-slate-300">
                                Each successful conversion job consumes one unit of usage. Job history, API key activity, and plan-level access live in the same dashboard.
                            </p>
                            <div class="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10">
                                <table class="min-w-full divide-y divide-white/10 text-sm">
                                    <thead class="bg-black/20 text-left text-slate-300">
                                        <tr>
                                            <th class="px-5 py-4 font-semibold">Plan</th>
                                            <th class="px-5 py-4 font-semibold">Exports</th>
                                            <th class="px-5 py-4 font-semibold">Usage model</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-white/10 bg-white/5 text-slate-200">
                                        <tr>
                                            <td class="px-5 py-4">Free</td>
                                            <td class="px-5 py-4">Starter quota</td>
                                            <td class="px-5 py-4">Good for testing the full flow</td>
                                        </tr>
                                        <tr>
                                            <td class="px-5 py-4">$9</td>
                                            <td class="px-5 py-4">Expanded monthly usage</td>
                                            <td class="px-5 py-4">Best for regular project exports</td>
                                        </tr>
                                        <tr>
                                            <td class="px-5 py-4">Custom</td>
                                            <td class="px-5 py-4">Tailored allocation</td>
                                            <td class="px-5 py-4">For agencies, teams, or higher-volume workflows</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p class="mt-5 text-sm leading-7 text-slate-400">
                                For best efficiency, export reusable sections instead of entire pages when you only need one component block.
                            </p>
                        </section>

                        <section id="troubleshooting" class="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-7 backdrop-blur">
                            <h2 class="text-2xl font-semibold text-white">Troubleshooting</h2>
                            <div class="mt-6 space-y-4">
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Figma plugin does nothing</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">Re-import the latest plugin manifest, confirm the endpoint points to your Laravel domain, and verify the selected layer is a top-level frame.</p>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Export succeeds but Elementor import looks wrong</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">Check whether the Figma source used strict widget naming, Auto Layout, and export-friendly structure. For layouts with heavy effects, flatten or simplify the unsupported effect stack.</p>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">WordPress import cannot see jobs</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">Confirm the platform URL is correct, the API key is valid, and the Laravel app exposes <code>/api/jobs</code> and <code>/api/jobs/{id}/download</code>.</p>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Images are missing after import</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">Re-import using the WordPress companion plugin so remote asset URLs are rewritten into your site’s media library instead of staying hot-linked.</p>
                                </div>
                            </div>
                        </section>

                        <section id="best-practices" class="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-7 backdrop-blur">
                            <h2 class="text-2xl font-semibold text-white">Best Practices</h2>
                            <div class="mt-6 grid gap-4 md:grid-cols-2">
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Use Auto Layout</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">Auto Layout maps much more reliably to Elementor containers and responsive stacks than fully freeform compositions.</p>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Prefer exportable sections</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">Convert reusable sections instead of entire pages when possible. This improves fidelity and gives you cleaner Elementor building blocks.</p>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Use strict naming</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">Names like <code>el-nav</code>, <code>el-form</code>, <code>el-slider</code>, <code>el-feature-grid</code>, and <code>el-pricing-table</code> dramatically reduce conversion ambiguity.</p>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Measure with screenshots</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">Use the regression CLI to compare a benchmark Figma screenshot against the rendered Elementor result and score the visual drift objectively.</p>
                                </div>
                            </div>
                        </section>

                        <section id="resources" class="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-7 backdrop-blur">
                            <h2 class="text-2xl font-semibold text-white">More Resources</h2>
                            <div class="mt-6 grid gap-4 md:grid-cols-2">
                                <a href="https://github.com/aneeshtan/figma2elementor" class="rounded-3xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-black/30">
                                    <div class="text-sm font-semibold text-white">GitHub Repository</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">Source code, changelog history, and issue tracking.</p>
                                </a>
                                <a href="https://github.com/aneeshtan/figma2elementor/issues" class="rounded-3xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-black/30">
                                    <div class="text-sm font-semibold text-white">Report an issue</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">File bugs, request features, or share conversion edge cases.</p>
                                </a>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">WordPress plugin package</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">Use the companion plugin under <code>apps/wordpress-plugin/figma2elementor</code>.</p>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Visual regression toolkit</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">Use <code>npm run regression:score</code> with saved fixtures in the <code>regression</code> folder.</p>
                                </div>
                            </div>
                        </section>

                        <section id="help" class="rounded-[1.5rem] border border-white/10 bg-slate-900/75 p-7 backdrop-blur">
                            <h2 class="text-2xl font-semibold text-white">Need Help?</h2>
                            <p class="mt-4 text-base leading-8 text-slate-300">
                                If you run into a conversion edge case, import failure, or fidelity mismatch, capture the Figma section, the exported JSON, and a screenshot of the Elementor result.
                            </p>
                            <div class="mt-6 grid gap-4 md:grid-cols-2">
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Best support payload</div>
                                    <ul class="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                                        <li>Figma frame or node reference</li>
                                        <li>Exported JSON file</li>
                                        <li>Rendered Elementor screenshot</li>
                                        <li>Any plugin or console error text</li>
                                    </ul>
                                </div>
                                <div class="rounded-3xl border border-white/10 bg-black/20 p-5">
                                    <div class="text-sm font-semibold text-white">Contact path</div>
                                    <p class="mt-2 text-sm leading-7 text-slate-300">
                                        Open a GitHub issue for public bugs or use your project support channel for private deployment and billing questions.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
            </main>

            <div class="mx-auto max-w-7xl px-6 pb-8">
                <x-platform-footer class="border-t border-white/10 pt-6" />
            </div>
        </div>
    </body>
</html>
