<?php

return [
    'plans' => [
        'free' => [
            'name' => 'Free',
            'price_label' => 'Free',
            'billing_type' => 'none',
            'monthly_quota' => 20,
            'seats' => 1,
            'features' => [
                'Starts at zero cost',
                '1 active user',
                'Up to 20 exports each month',
                'Basic support',
            ],
        ],
        'launch' => [
            'name' => 'Team',
            'price_label' => '$24/mo',
            'billing_type' => 'stripe',
            'stripe_price_id' => env('STRIPE_PRICE_LAUNCH_MONTHLY'),
            'monthly_quota' => 150,
            'seats' => 3,
            'features' => [
                'First team milestone',
                'Up to 3 active users',
                'Up to 150 exports each month',
                'Priority support',
                'Best for small collaborative teams',
            ],
        ],
        'growth' => [
            'name' => 'Studio',
            'price_label' => '$79/mo',
            'billing_type' => 'stripe',
            'stripe_price_id' => env('STRIPE_PRICE_GROWTH_MONTHLY'),
            'monthly_quota' => 600,
            'seats' => 10,
            'features' => [
                'Growth milestone',
                'Up to 10 active users',
                'Up to 600 exports each month',
                'Faster support and higher team throughput',
            ],
        ],
        'custom' => [
            'name' => 'Custom',
            'price_label' => 'Custom',
            'billing_type' => 'contact',
            'monthly_quota' => null,
            'seats' => null,
            'features' => [
                'Custom seat milestones',
                'Agency or multi-team setup',
                'Priority onboarding',
            ],
        ],
    ],
];
