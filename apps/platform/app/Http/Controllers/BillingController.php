<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class BillingController extends Controller
{
    public function checkout(Request $request, string $plan): Response|RedirectResponse
    {
        $planConfig = config("figma2element.plans.{$plan}");

        if (! $planConfig || ($planConfig['billing_type'] ?? null) !== 'stripe') {
            throw ValidationException::withMessages([
                'plan' => 'That plan cannot be purchased online.',
            ]);
        }

        $priceId = $planConfig['stripe_price_id'] ?? null;
        if (! $priceId) {
            throw ValidationException::withMessages([
                'plan' => 'Set the Stripe price ID for this plan before checkout.',
            ]);
        }

        if ($request->user()->subscribed('default')) {
            return redirect()
                ->route('billing.portal')
                ->with('status', 'Manage your existing subscription from the billing portal.');
        }

        return $request->user()
            ->newSubscription('default', $priceId)
            ->checkout([
                'success_url' => route('dashboard', ['checkout' => 'success']),
                'cancel_url' => route('dashboard', ['checkout' => 'cancelled']),
                'metadata' => [
                    'product' => 'figma2element',
                    'plan' => $plan,
                ],
            ]);
    }

    public function portal(Request $request): RedirectResponse
    {
        if (! $request->user()->stripe_id) {
            return redirect()
                ->route('dashboard')
                ->with('status', 'No Stripe billing profile exists yet.');
        }

        return $request->user()->redirectToBillingPortal(route('dashboard'));
    }
}
