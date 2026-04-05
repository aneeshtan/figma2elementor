<?php

namespace App\Http\Controllers;

use App\Models\ConversionJob;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __invoke(Request $request): View
    {
        $user = $request->user();
        $subscription = $user->subscription('default');
        $activePriceId = optional($subscription?->items->first())->stripe_price;
        $plans = config('figma2element.plans');
        $pricingBands = config('figma2element.adoption_bands', []);
        $totalUsers = User::count();
        $currentPlanKey = collect($plans)
            ->keys()
            ->first(fn (string $key): bool => ($plans[$key]['stripe_price_id'] ?? null) === $activePriceId);

        if (! is_string($currentPlanKey)) {
            $currentPlanKey = $subscription && $subscription->valid() ? 'custom' : 'free';
        }

        $currentBandIndex = collect($pricingBands)
            ->search(function (array $band) use ($totalUsers): bool {
                $start = (int) ($band['start_users'] ?? 0);
                $end = $band['end_users'] ?? null;

                return $totalUsers >= $start && ($end === null || $totalUsers <= (int) $end);
            });

        if ($currentBandIndex === false) {
            $currentBandIndex = 0;
        }

        $currentBand = $pricingBands[$currentBandIndex] ?? null;
        $nextBand = $pricingBands[$currentBandIndex + 1] ?? null;

        return view('dashboard', [
            'plans' => $plans,
            'pricingBands' => $pricingBands,
            'currentBand' => $currentBand,
            'nextBand' => $nextBand,
            'totalUsers' => $totalUsers,
            'currentPlanKey' => $currentPlanKey,
            'subscription' => $subscription,
            'apiKeys' => $user->apiKeys()->whereNull('revoked_at')->latest()->get(),
            'activeApiKeyCount' => $user->apiKeys()->whereNull('revoked_at')->count(),
            'jobs' => $user->conversionJobs()->latest()->limit(10)->get(),
            'pluginEndpoint' => route('api.convert'),
            'monthlyUsage' => $user->conversionJobs()
                ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->sum('credits_used'),
        ]);
    }

    public function download(Request $request, ConversionJob $job): StreamedResponse|RedirectResponse
    {
        abort_unless((int) $job->user_id === (int) $request->user()->id, 404);

        $template = data_get($job->meta, 'template');
        if (! is_array($template) || $template === []) {
            return redirect()
                ->route('dashboard')
                ->with('status', 'This export is no longer available for download.');
        }

        $baseName = Str::slug($job->export_name ?: $job->source_name ?: 'elementor-export');
        $fileName = trim($baseName) !== '' ? $baseName : 'elementor-export';
        $fileName .= '-'.$job->id.'.json';

        return response()->streamDownload(function () use ($template): void {
            echo json_encode($template, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        }, $fileName, [
            'Content-Type' => 'application/json; charset=UTF-8',
        ]);
    }
}
