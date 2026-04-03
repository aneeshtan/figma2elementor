<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __invoke(Request $request): View
    {
        $user = $request->user();
        $subscription = $user->subscription('default');
        $activePriceId = optional($subscription?->items->first())->stripe_price;
        $plans = config('figma2element.plans');
        $currentPlanKey = collect($plans)
            ->keys()
            ->first(fn (string $key): bool => ($plans[$key]['stripe_price_id'] ?? null) === $activePriceId);

        if (! is_string($currentPlanKey)) {
            $currentPlanKey = $subscription && $subscription->valid() ? 'custom' : 'free';
        }

        return view('dashboard', [
            'plans' => $plans,
            'currentPlanKey' => $currentPlanKey,
            'subscription' => $subscription,
            'apiKeys' => $user->apiKeys()->latest()->get(),
            'jobs' => $user->conversionJobs()->latest()->limit(10)->get(),
            'monthlyUsage' => $user->conversionJobs()
                ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->sum('credits_used'),
        ]);
    }
}
