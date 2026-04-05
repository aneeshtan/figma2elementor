<footer {{ $attributes->merge(['class' => 'text-center text-xs text-slate-400']) }}>
    <div>Figma2Element v0.4.3</div>
    <div class="mt-2 flex items-center justify-center gap-4">
        <a href="{{ route('privacy') }}" class="text-orange-300 transition hover:text-orange-200">Privacy</a>
        <a href="{{ route('support') }}" class="text-orange-300 transition hover:text-orange-200">Support</a>
    </div>
    <div class="mt-2">Copyright © 2026 Figma2Element. Prompted by Farshad and built by AI.</div>
</footer>
