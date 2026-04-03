<?php

return [
    'plans' => [
        'free' => [
            'name' => 'Free',
            'price_label' => 'Free',
            'billing_type' => 'none',
            'monthly_quota' => 15,
            'features' => [
                'Manual exports',
                'Single user',
                'Basic support',
            ],
        ],
        'pro' => [
            'name' => 'Pro',
            'price_label' => '$9/mo',
            'billing_type' => 'stripe',
            'stripe_price_id' => env('STRIPE_PRICE_PRO_MONTHLY'),
            'monthly_quota' => 150,
            'features' => [
                'More exports per month',
                'Priority support',
                'Stripe subscription billing',
            ],
        ],
        'custom' => [
            'name' => 'Custom',
            'price_label' => 'Custom',
            'billing_type' => 'contact',
            'monthly_quota' => null,
            'features' => [
                'Custom quotas',
                'Agency / team setup',
                'Priority onboarding',
            ],
        ],
    ],
];
