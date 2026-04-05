<?php

return [
    'plans' => [
        'free' => [
            'name' => 'Free',
            'price_label' => 'Free',
            'billing_type' => 'none',
            'monthly_quota' => 20,
            'features' => [
                'Start at zero cost',
                'Single user',
                'Up to 20 exports each month',
                'Basic support',
            ],
        ],
        'launch' => [
            'name' => 'Launch',
            'price_label' => '$19/mo',
            'billing_type' => 'stripe',
            'stripe_price_id' => env('STRIPE_PRICE_LAUNCH_MONTHLY'),
            'monthly_quota' => 100,
            'features' => [
                'First paid milestone',
                'Up to 100 exports each month',
                'Priority support',
                'Best for regular solo usage',
            ],
        ],
        'growth' => [
            'name' => 'Growth',
            'price_label' => '$49/mo',
            'billing_type' => 'stripe',
            'stripe_price_id' => env('STRIPE_PRICE_GROWTH_MONTHLY'),
            'monthly_quota' => 400,
            'features' => [
                'Higher-volume milestone',
                'Up to 400 exports each month',
                'Faster support and larger throughput',
                'Best for heavy weekly production',
            ],
        ],
        'custom' => [
            'name' => 'Custom',
            'price_label' => 'Custom',
            'billing_type' => 'contact',
            'monthly_quota' => null,
            'features' => [
                'Custom milestones and quotas',
                'Agency or team setup',
                'Priority onboarding',
            ],
        ],
    ],
];
