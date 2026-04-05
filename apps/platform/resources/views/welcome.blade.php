<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name') === 'Laravel' ? 'Figma2Element' : config('app.name', 'Figma2Element') }}</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        <style>
            .pricing-showcase {
                --ps-line: rgba(255, 255, 255, 0.08);
                --ps-text: #f5f7fb;
                --ps-muted: #97a3bf;
                --ps-accent: #7c5cff;
                --ps-accent-2: #34d399;
                --ps-glow: rgba(124, 92, 255, 0.35);
                --ps-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
                --ps-radius: 28px;
                position: relative;
                overflow: hidden;
                border: 1px solid var(--ps-line);
                border-radius: 36px;
                padding: 44px;
                background: linear-gradient(180deg, rgba(8, 18, 44, 0.92), rgba(5, 12, 31, 0.96));
                box-shadow: var(--ps-shadow);
            }

            .pricing-showcase::before {
                content: "";
                position: absolute;
                inset: -20% auto auto -10%;
                width: 360px;
                height: 360px;
                border-radius: 999px;
                background: radial-gradient(circle, rgba(124, 92, 255, 0.22), transparent 68%);
                pointer-events: none;
            }

            .pricing-showcase::after {
                content: "";
                position: absolute;
                right: -120px;
                bottom: -120px;
                width: 340px;
                height: 340px;
                border-radius: 999px;
                background: radial-gradient(circle, rgba(52, 211, 153, 0.14), transparent 65%);
                pointer-events: none;
            }

            .pricing-showcase__topbar,
            .pricing-showcase__grid {
                position: relative;
                z-index: 1;
            }

            .pricing-showcase__topbar {
                display: flex;
                gap: 24px;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 30px;
            }

            .pricing-showcase__eyebrow {
                font-size: 0.82rem;
                letter-spacing: 0.24em;
                text-transform: uppercase;
                font-weight: 700;
                color: #ffb86b;
                margin-bottom: 16px;
            }

            .pricing-showcase__title {
                margin: 0;
                font-size: clamp(2rem, 4vw, 3.5rem);
                line-height: 1.05;
                letter-spacing: -0.04em;
                max-width: 760px;
            }

            .pricing-showcase__subtext {
                margin-top: 16px;
                font-size: 1.08rem;
                line-height: 1.7;
                color: var(--ps-muted);
                max-width: 860px;
            }

            .pricing-showcase__cta {
                flex-shrink: 0;
                align-self: center;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 220px;
                min-height: 94px;
                padding: 20px 28px;
                border-radius: 999px;
                border: 1px solid rgba(255, 255, 255, 0.12);
                background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
                color: var(--ps-text);
                text-decoration: none;
                font-weight: 700;
                font-size: 1.05rem;
                transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
            }

            .pricing-showcase__cta:hover {
                transform: translateY(-2px);
                border-color: rgba(124, 92, 255, 0.45);
                box-shadow: 0 0 0 8px rgba(124, 92, 255, 0.08);
            }

            .pricing-showcase__grid {
                display: grid;
                grid-template-columns: 1.7fr 1fr;
                border: 1px solid var(--ps-line);
                border-radius: var(--ps-radius);
                overflow: hidden;
                background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.025));
            }

            .pricing-showcase__milestones,
            .pricing-showcase__summary {
                padding: 34px;
            }

            .pricing-showcase__summary {
                background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.03));
                border-left: 1px solid var(--ps-line);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }

            .pricing-showcase__section-label {
                color: #7f8db0;
                text-transform: uppercase;
                letter-spacing: 0.28em;
                font-weight: 700;
                font-size: 0.82rem;
                margin-bottom: 22px;
            }

            .pricing-showcase__stats-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                margin-bottom: 26px;
            }

            .pricing-showcase__big-number {
                font-size: clamp(2rem, 4vw, 3.8rem);
                font-weight: 800;
                line-height: 1;
                letter-spacing: -0.05em;
            }

            .pricing-showcase__mini-chip {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 14px;
                border-radius: 999px;
                border: 1px solid rgba(255,255,255,0.1);
                background: rgba(255,255,255,0.03);
                color: #d4dcf0;
                font-weight: 600;
                font-size: 0.92rem;
            }

            .pricing-showcase__track-wrap {
                position: relative;
                padding: 32px 6px 14px;
            }

            .pricing-showcase__track {
                position: relative;
                height: 10px;
                border-radius: 999px;
                background: linear-gradient(90deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04));
                overflow: visible;
            }

            .pricing-showcase__progress {
                position: absolute;
                inset: 0 auto 0 0;
                width: 0;
                border-radius: inherit;
                background: linear-gradient(90deg, var(--ps-accent), var(--ps-accent-2));
                box-shadow: 0 0 22px var(--ps-glow);
                transition: width 1.4s ease;
            }

            .pricing-showcase__point {
                position: absolute;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 18px;
                height: 18px;
                border-radius: 50%;
                border: 3px solid rgba(255,255,255,0.22);
                background: #0a1735;
                box-shadow: 0 0 0 7px rgba(255,255,255,0.02);
            }

            .pricing-showcase__point.is-active {
                width: 24px;
                height: 24px;
                border-color: rgba(255,255,255,0.42);
                background: radial-gradient(circle at 35% 35%, #ffffff, #c6b8ff 35%, var(--ps-accent) 66%, #5638d7 100%);
                box-shadow: 0 0 0 8px rgba(124, 92, 255, 0.18), 0 0 26px rgba(124, 92, 255, 0.42);
            }

            .pricing-showcase__labels {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 14px;
                margin-top: 18px;
            }

            .pricing-showcase__pill {
                justify-self: center;
                min-width: 88px;
                text-align: center;
                padding: 10px 12px;
                border-radius: 999px;
                border: 1px solid rgba(255,255,255,0.08);
                color: #cbd5e8;
                background: rgba(255,255,255,0.025);
                font-weight: 700;
                font-size: 0.96rem;
                letter-spacing: -0.01em;
                backdrop-filter: blur(10px);
                transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
            }

            .pricing-showcase__pill:hover,
            .pricing-showcase__pill.is-active {
                color: #fff;
                border-color: rgba(255,255,255,0.22);
                background: linear-gradient(180deg, rgba(124, 92, 255, 0.22), rgba(124, 92, 255, 0.12));
                box-shadow: 0 8px 24px rgba(124, 92, 255, 0.18);
            }

            .pricing-showcase__price {
                font-size: clamp(3.2rem, 5vw, 5rem);
                font-weight: 800;
                letter-spacing: -0.06em;
                line-height: 1;
                margin: 8px 0 18px;
            }

            .pricing-showcase__description {
                color: var(--ps-muted);
                line-height: 1.8;
                font-size: 1.03rem;
                max-width: 430px;
            }

            .pricing-showcase__summary-footer {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 28px;
            }

            .pricing-showcase__summary-footer .pricing-showcase__mini-chip strong {
                color: #fff;
            }

            .pricing-showcase__insights {
                margin-top: 34px;
                padding: 24px;
                border-radius: 24px;
                border: 1px solid rgba(255,255,255,0.08);
                background:
                    radial-gradient(circle at left top, rgba(124, 92, 255, 0.14), transparent 38%),
                    linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015));
                box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
            }

            .pricing-showcase__insight-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                margin-bottom: 18px;
                flex-wrap: wrap;
            }

            .pricing-showcase__insight-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 800;
                font-size: 1.04rem;
                color: #ffffff;
            }

            .pricing-showcase__icon {
                width: 34px;
                height: 34px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 999px;
                background: rgba(124, 92, 255, 0.18);
                box-shadow: 0 0 0 6px rgba(124, 92, 255, 0.08);
                font-size: 1rem;
            }

            .pricing-showcase__insight-badge {
                padding: 10px 14px;
                border-radius: 999px;
                border: 1px solid rgba(255,255,255,0.09);
                background: rgba(255,255,255,0.03);
                color: #d9e1f3;
                font-weight: 700;
                font-size: 0.92rem;
            }

            .pricing-showcase__next-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 14px;
                margin-bottom: 20px;
            }

            .pricing-showcase__next-card {
                padding: 16px;
                border-radius: 20px;
                border: 1px solid rgba(255,255,255,0.07);
                background: rgba(255,255,255,0.02);
            }

            .pricing-showcase__next-label {
                color: #8ea0c5;
                font-size: 0.78rem;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                font-weight: 700;
                margin-bottom: 10px;
            }

            .pricing-showcase__next-value {
                color: #ffffff;
                font-size: 1.18rem;
                font-weight: 800;
                line-height: 1.3;
                letter-spacing: -0.02em;
            }

            .pricing-showcase__next-value small {
                display: block;
                color: #9fb0d0;
                font-size: 0.92rem;
                font-weight: 600;
                letter-spacing: 0;
                margin-top: 6px;
            }

            .pricing-showcase__action-row {
                display: flex;
                gap: 14px;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                padding-top: 18px;
                border-top: 1px solid rgba(255,255,255,0.07);
            }

            .pricing-showcase__action-copy {
                color: #c8d3ea;
                font-size: 0.98rem;
                line-height: 1.7;
                max-width: 520px;
            }

            .pricing-showcase__lock-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 14px 22px;
                border-radius: 999px;
                border: 1px solid rgba(255,255,255,0.12);
                background: linear-gradient(90deg, rgba(124, 92, 255, 0.92), rgba(52, 211, 153, 0.8));
                color: #fff;
                text-decoration: none;
                font-weight: 800;
                letter-spacing: -0.01em;
                box-shadow: 0 10px 32px rgba(124, 92, 255, 0.28);
                transition: transform 0.25s ease, box-shadow 0.25s ease;
            }

            .pricing-showcase__lock-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 14px 38px rgba(124, 92, 255, 0.36);
            }

            @media (max-width: 980px) {
                .pricing-showcase {
                    padding: 28px;
                }

                .pricing-showcase__topbar,
                .pricing-showcase__grid {
                    display: block;
                }

                .pricing-showcase__topbar {
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                }

                .pricing-showcase__cta {
                    min-height: 72px;
                    min-width: 100%;
                }

                .pricing-showcase__summary {
                    border-left: none;
                    border-top: 1px solid var(--ps-line);
                }

                .pricing-showcase__labels {
                    grid-template-columns: repeat(3, 1fr);
                }

                .pricing-showcase__next-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 640px) {
                .pricing-showcase {
                    padding: 20px;
                    border-radius: 24px;
                }

                .pricing-showcase__milestones,
                .pricing-showcase__summary {
                    padding: 22px;
                }

                .pricing-showcase__labels {
                    grid-template-columns: repeat(2, 1fr);
                }

                .pricing-showcase__stats-row,
                .pricing-showcase__action-row,
                .pricing-showcase__insight-top {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .pricing-showcase__lock-btn {
                    width: 100%;
                }
            }
        </style>
    </head>
    <body class="bg-slate-950 text-white">
        @php
            $adoptionBands = config('figma2element.adoption_bands', []);
            $sliderBands = array_slice($adoptionBands, 0, 6);
            try {
                $currentUsers = \App\Models\User::query()->count();
            } catch (\Throwable) {
                $currentUsers = 0;
            }
            $currentBand = collect($adoptionBands)->first(function (array $band) use ($currentUsers) {
                $endUsers = $band['end_users'] ?? null;

                return $currentUsers >= $band['start_users']
                    && ($endUsers === null || $currentUsers <= $endUsers);
            }) ?? ($adoptionBands[0] ?? null);
            $foundersBand = $adoptionBands[0] ?? null;
            $founderLimit = $foundersBand['end_users'] ?? 100;
            $founderClaimed = min($currentUsers, $founderLimit);
            $founderRemaining = max($founderLimit - $founderClaimed, 0);
            $showFoundersOpen = $founderRemaining > 0;
            $progressRatio = $founderLimit > 0 ? min($founderClaimed / $founderLimit, 1) : 0;
            $milestonePositions = [8, 24, 40, 56, 72, 88];
            $activeMilestoneIndex = collect($sliderBands)->search(fn (array $band) => ($band['id'] ?? null) === ($currentBand['id'] ?? null));
            $activeMilestoneIndex = $activeMilestoneIndex === false ? 0 : $activeMilestoneIndex;
            $activePointLeft = $milestonePositions[min($activeMilestoneIndex, count($milestonePositions) - 1)] ?? 8;
            $progressWidth = max(4, round($activePointLeft, 2));
            $currentPriceDisplay = ($currentBand['price_label'] ?? 'Free') === 'Free'
                ? 'Free'
                : preg_replace('/\/mo$/', '', $currentBand['price_label']);
            $currentPriceSuffix = ($currentBand['price_label'] ?? 'Free') === 'Free' ? '' : '/mo';
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

                <section class="mt-12 pricing-showcase">
                    <div class="pricing-showcase__topbar">
                        <div>
                            <div class="pricing-showcase__eyebrow">Founders Giveaway</div>
                            <h2 class="pricing-showcase__title">Adoption-based pricing with a live milestone bar.</h2>
                            <p class="pricing-showcase__subtext">
                                Only <strong>{{ number_format($founderClaimed) }} out of {{ number_format($founderLimit) }}</strong> founder spots are taken.
                                Early adopters lock in the lowest public entry point before the next milestone unlocks and pricing steps up.
                            </p>
                        </div>
                        <a href="{{ route('docs') }}#plan-limits-usage" class="pricing-showcase__cta">See the full milestone model</a>
                    </div>

                    <div class="pricing-showcase__grid">
                        <div class="pricing-showcase__milestones">
                            <div class="pricing-showcase__section-label">Total Platform Users</div>

                            <div class="pricing-showcase__stats-row">
                                <div class="pricing-showcase__big-number">{{ number_format($founderClaimed) }}/{{ number_format($founderLimit) }}</div>
                                <div class="pricing-showcase__mini-chip">{{ number_format($founderRemaining) }} founder spots still available</div>
                            </div>

                            <div class="pricing-showcase__track-wrap">
                                <div class="pricing-showcase__track">
                                    <div
                                        class="pricing-showcase__progress"
                                        data-pricing-progress
                                        data-target-width="{{ $progressWidth }}%"
                                    ></div>
                                    @foreach ($sliderBands as $index => $band)
                                        <span
                                            class="pricing-showcase__point {{ $index === $activeMilestoneIndex ? 'is-active' : '' }}"
                                            data-pricing-point
                                            data-target-left="{{ $milestonePositions[$index] ?? 88 }}%"
                                            style="left: {{ $milestonePositions[$index] ?? 88 }}%;"
                                        ></span>
                                    @endforeach
                                </div>

                                <div class="pricing-showcase__labels">
                                    @foreach ($sliderBands as $index => $band)
                                        <div class="pricing-showcase__pill {{ $index === $activeMilestoneIndex ? 'is-active' : '' }}">
                                            {{ number_format($band['end_users'] ?? 10000) }}{{ ($band['end_users'] ?? null) ? ' users' : '+' }}
                                        </div>
                                    @endforeach
                                </div>
                            </div>

                            <div class="pricing-showcase__insights">
                                <div class="pricing-showcase__insight-top">
                                    <div class="pricing-showcase__insight-title"><span class="pricing-showcase__icon">⚡</span>Why join now</div>
                                    <div class="pricing-showcase__insight-badge">{{ $showFoundersOpen ? 'Founders tier is live' : 'Founders tier is closed' }}</div>
                                </div>

                                <div class="pricing-showcase__next-grid">
                                    <div class="pricing-showcase__next-card">
                                        <div class="pricing-showcase__next-label">You are here</div>
                                        <div class="pricing-showcase__next-value">{{ $currentBand['price_label'] ?? 'Free' }}<small>{{ $showFoundersOpen ? 'Reserved for the first 100 users' : 'Current public entry band' }}</small></div>
                                    </div>
                                    <div class="pricing-showcase__next-card">
                                        <div class="pricing-showcase__next-label">Next milestone</div>
                                        <div class="pricing-showcase__next-value">{{ number_format($founderLimit) }} users<small>Then the public entry price steps up</small></div>
                                    </div>
                                    <div class="pricing-showcase__next-card">
                                        <div class="pricing-showcase__next-label">Availability</div>
                                        <div class="pricing-showcase__next-value">{{ number_format($founderRemaining) }} seats left<small>Join before founder access closes</small></div>
                                    </div>
                                </div>

                                <div class="pricing-showcase__action-row">
                                    <div class="pricing-showcase__action-copy">
                                        Lock in founder access while seats are still open. Once the first {{ number_format($founderLimit) }} users join, this milestone closes and the next public price becomes active.
                                    </div>
                                    <a href="{{ route('register') }}" class="pricing-showcase__lock-btn">Lock in {{ $currentBand['price_label'] ?? 'Free' }} access →</a>
                                </div>
                            </div>
                        </div>

                        <aside class="pricing-showcase__summary">
                            <div>
                                <div class="pricing-showcase__section-label">Current Public Entry</div>
                                <div class="pricing-showcase__price">{{ $currentPriceDisplay }}<span style="font-size: clamp(1.8rem, 2.5vw, 3rem); font-weight: 600;">{{ $currentPriceSuffix }}</span></div>
                                <div class="pricing-showcase__mini-chip">{{ number_format($founderRemaining) }} seats remaining</div>
                                <p class="pricing-showcase__description">
                                    {{ number_format($founderRemaining) }} of the {{ number_format($founderLimit) }} founder seats are still available.
                                    Join now to secure {{ strtolower($currentBand['price_label'] ?? 'free') }} access before this opening fills and the public entry price increases.
                                </p>
                            </div>

                            <div class="pricing-showcase__summary-footer">
                                <div class="pricing-showcase__mini-chip"><strong>{{ number_format($founderClaimed) }}/{{ number_format($founderLimit) }}</strong>&nbsp;founder seats claimed</div>
                                <div class="pricing-showcase__mini-chip"><strong>{{ number_format($founderRemaining) }}</strong>&nbsp;spots remaining</div>
                            </div>
                        </aside>
                    </div>
                </section>
            </main>

            <div class="mx-auto max-w-6xl px-6 pb-8">
                <x-platform-footer class="border-t border-white/10 pt-6" />
            </div>
        </div>
        <script>
            window.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('[data-pricing-progress]').forEach((bar) => {
                    window.requestAnimationFrame(() => {
                        bar.style.width = bar.dataset.targetWidth || '0%';
                    });
                });
            });
        </script>
    </body>
</html>
