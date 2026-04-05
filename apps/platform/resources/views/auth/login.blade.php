<x-guest-layout>
    <div class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-orange-400">Sign in</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight text-white">Return to your dashboard</h2>
        <p class="mt-3 text-sm leading-6 text-slate-400">Use your account to manage API keys, billing, and Figma conversion history.</p>
    </div>

    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <div class="mb-6 space-y-3">
        <a
            href="{{ route('auth.google.redirect') }}"
            class="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-orange-400/50 hover:bg-white/10"
        >
            <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.7-2.6C17 3.3 14.8 2.3 12 2.3A9.7 9.7 0 0 0 2.3 12 9.7 9.7 0 0 0 12 21.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.5H12Z"/>
                <path fill="#34A853" d="M2.3 12c0 1.6.4 3.1 1.2 4.4l3.5-2.7a6 6 0 0 1 0-3.4L3.5 7.6A9.6 9.6 0 0 0 2.3 12Z"/>
                <path fill="#FBBC05" d="M12 21.7c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2 .9-3.5.9-2.5 0-4.7-1.7-5.5-4l-3.5 2.7A9.7 9.7 0 0 0 12 21.7Z"/>
                <path fill="#4285F4" d="M18.9 19.2c2-1.8 3.1-4.4 3.1-7.5 0-.6-.1-1.1-.2-1.5H12v3.9h5.5c-.2 1.1-.8 2.1-1.8 2.8l3.2 2.3Z"/>
            </svg>
            Continue with Google
        </a>
        <p class="text-center text-xs text-slate-500">Google sign-in creates or links your Figma2Element account automatically.</p>
    </div>

    <div class="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-slate-500">
        <span class="h-px flex-1 bg-white/10"></span>
        <span>Email login</span>
        <span class="h-px flex-1 bg-white/10"></span>
    </div>

    <form method="POST" action="{{ route('login') }}">
        @csrf

        <!-- Email Address -->
        <div>
            <x-input-label for="email" :value="__('Email')" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <!-- Password -->
        <div class="mt-4">
            <x-input-label for="password" :value="__('Password')" />

            <x-text-input id="password" class="block mt-1 w-full"
                            type="password"
                            name="password"
                            required autocomplete="current-password" />

            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <!-- Remember Me -->
        <div class="mt-5 block">
            <label for="remember_me" class="inline-flex items-center gap-2">
                <input id="remember_me" type="checkbox" class="rounded border-white/20 bg-white/5 text-orange-500 shadow-sm focus:ring-orange-400 focus:ring-offset-0" name="remember">
                <span class="text-sm text-slate-400">{{ __('Remember me') }}</span>
            </label>
        </div>

        <div class="mt-6 flex items-center justify-between gap-4">
            @if (Route::has('password.request'))
                <a class="text-sm text-slate-400 transition hover:text-white focus:outline-none" href="{{ route('password.request') }}">
                    {{ __('Forgot your password?') }}
                </a>
            @endif

            <x-primary-button>
                {{ __('Log in') }}
            </x-primary-button>
        </div>

        <div class="mt-8 border-t border-white/10 pt-5 text-sm text-slate-400">
            Need an account?
            <a class="font-medium text-orange-400 transition hover:text-orange-300" href="{{ route('register') }}">Create one here</a>
        </div>
    </form>
</x-guest-layout>
