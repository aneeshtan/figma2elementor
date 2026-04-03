<?php

use App\Http\Controllers\ConverterProxyController;
use Illuminate\Support\Facades\Route;

Route::post('/convert', [ConverterProxyController::class, 'convert'])->name('api.convert');
Route::get('/jobs', [ConverterProxyController::class, 'jobs'])->name('api.jobs');
Route::get('/jobs/{job}', [ConverterProxyController::class, 'showJob'])->name('api.jobs.show');
Route::get('/jobs/{job}/download', [ConverterProxyController::class, 'downloadJob'])->name('api.jobs.download');
Route::get('/assets/{asset}', [ConverterProxyController::class, 'asset'])
    ->where('asset', '.*')
    ->name('api.asset');
