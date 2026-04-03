@props(['disabled' => false])

<input @disabled($disabled) {{ $attributes->merge(['class' => 'mt-2 block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 shadow-sm outline-none transition focus:border-orange-400 focus:bg-white/8 focus:ring-2 focus:ring-orange-400/30 disabled:cursor-not-allowed disabled:opacity-60']) }}>
