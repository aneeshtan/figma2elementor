<?php

use App\Http\Controllers\ConverterProxyController;
use Illuminate\Support\Facades\Route;

Route::post('/convert', [ConverterProxyController::class, 'convert'])->name('api.convert');
Route::get('/assets/{asset}', [ConverterProxyController::class, 'asset'])
    ->where('asset', '.*')
    ->name('api.asset');
