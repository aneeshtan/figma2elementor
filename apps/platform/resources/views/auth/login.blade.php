<x-guest-layout>
    <div class="mb-8">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-orange-400">Sign in</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight text-white">Return to your dashboard</h2>
        <p class="mt-3 text-sm leading-6 text-slate-400">Use your account to manage API keys, billing, and Figma conversion history.</p>
    </div>

    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

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
