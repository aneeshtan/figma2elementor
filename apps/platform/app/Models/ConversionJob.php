<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversionJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'api_key_id',
        'source_name',
        'status',
        'credits_used',
        'export_name',
        'export_path',
        'meta',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function apiKey(): BelongsTo
    {
        return $this->belongsTo(ApiKey::class);
    }
}
