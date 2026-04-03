<?php

namespace App\Http\Controllers;

use App\Models\ApiKey;
use App\Models\ConversionJob;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ConverterProxyController extends Controller
{
    public function convert(Request $request): JsonResponse
    {
        $apiKey = $this->resolveApiKey($request);
        if (! $apiKey) {
            return $this->invalidApiKeyResponse();
        }

        $source = $request->input('source', $request->all());

        if (! is_array($source) || $source === []) {
            return response()->json([
                'ok' => false,
                'error' => 'The request must include a Figma source payload.',
            ], 422);
        }

        try {
            $serviceUrl = rtrim((string) config('services.converter.url'), '/');
            $response = Http::timeout(120)
                ->acceptJson()
                ->withHeaders([
                    'x-api-key' => (string) config('services.converter.service_key'),
                    'x-client-name' => (string) $request->header('x-client-name', 'figma-plugin'),
                    'x-origin-app' => (string) $request->header('x-origin-app', 'figma'),
                    'x-forwarded-host' => (string) $request->getHost().($request->getPort() ? ':'.$request->getPort() : ''),
                    'x-forwarded-proto' => $request->getScheme(),
                ])
                ->post("{$serviceUrl}/api/convert", [
                    'source' => $source,
                ]);
        } catch (ConnectionException $exception) {
            return response()->json([
                'ok' => false,
                'error' => 'Could not reach the converter service.',
            ], 502);
        }

        $payload = $response->json();
        if (! is_array($payload)) {
            return response()->json([
                'ok' => false,
                'error' => 'The converter service returned an invalid response.',
            ], 502);
        }

        if (! $response->successful()) {
            return response()->json($payload, $response->status());
        }

        $apiKey->forceFill([
            'last_used_at' => now(),
        ])->save();

        $job = ConversionJob::create([
            'user_id' => $apiKey->user_id,
            'api_key_id' => $apiKey->id,
            'source_name' => data_get($source, 'name', data_get($payload, 'template.title', 'Imported Frame')),
            'status' => 'completed',
            'credits_used' => 1,
            'export_name' => data_get($payload, 'template.title', 'Elementor Template'),
            'meta' => [
                'report' => $payload['report'] ?? null,
                'template' => $payload['template'] ?? null,
                'origin' => $request->header('x-origin-app', 'figma'),
                'client_name' => $request->header('x-client-name', 'figma-plugin'),
            ],
            'completed_at' => now(),
        ]);

        return response()->json([
            ...$payload,
            'job' => [
                'id' => (string) $job->id,
                'source_name' => $job->source_name,
                'status' => $job->status,
                'completed_at' => optional($job->completed_at)->toIso8601String(),
            ],
        ]);
    }

    public function jobs(Request $request): JsonResponse
    {
        $apiKey = $this->resolveApiKey($request);
        if (! $apiKey) {
            return $this->invalidApiKeyResponse();
        }

        $jobs = ConversionJob::query()
            ->where('user_id', $apiKey->user_id)
            ->latest()
            ->limit(25)
            ->get()
            ->map(function (ConversionJob $job): array {
                return [
                    'id' => (string) $job->id,
                    'source_name' => $job->source_name,
                    'export_name' => $job->export_name,
                    'status' => $job->status,
                    'completed_at' => optional($job->completed_at)->toIso8601String(),
                    'report' => data_get($job->meta, 'report'),
                ];
            })
            ->values();

        return response()->json([
            'ok' => true,
            'jobs' => $jobs,
        ]);
    }

    public function showJob(Request $request, ConversionJob $job): JsonResponse
    {
        $apiKey = $this->resolveApiKey($request);
        if (! $apiKey) {
            return $this->invalidApiKeyResponse();
        }

        if ((int) $job->user_id !== (int) $apiKey->user_id) {
            return response()->json([
                'ok' => false,
                'error' => 'This conversion job is not available for the supplied API key.',
            ], 404);
        }

        return response()->json([
            'ok' => true,
            'job' => [
                'id' => (string) $job->id,
                'source_name' => $job->source_name,
                'export_name' => $job->export_name,
                'status' => $job->status,
                'completed_at' => optional($job->completed_at)->toIso8601String(),
                'report' => data_get($job->meta, 'report'),
                'template' => data_get($job->meta, 'template'),
            ],
        ]);
    }

    public function downloadJob(Request $request, ConversionJob $job): JsonResponse
    {
        $apiKey = $this->resolveApiKey($request);
        if (! $apiKey) {
            return $this->invalidApiKeyResponse();
        }

        if ((int) $job->user_id !== (int) $apiKey->user_id) {
            return response()->json([
                'ok' => false,
                'error' => 'This conversion job is not available for the supplied API key.',
            ], 404);
        }

        $template = data_get($job->meta, 'template');
        if (! is_array($template) || $template === []) {
            return response()->json([
                'ok' => false,
                'error' => 'This conversion job does not contain an export template.',
            ], 404);
        }

        return response()->json([
            'ok' => true,
            'job' => [
                'id' => (string) $job->id,
                'source_name' => $job->source_name,
                'export_name' => $job->export_name,
                'status' => $job->status,
                'completed_at' => optional($job->completed_at)->toIso8601String(),
            ],
            'template' => $template,
        ]);
    }

    public function asset(Request $request, string $asset): StreamedResponse|JsonResponse
    {
        try {
            $serviceUrl = rtrim((string) config('services.converter.url'), '/');
            $response = Http::timeout(120)
                ->withHeaders([
                    'x-forwarded-host' => (string) $request->getHost().($request->getPort() ? ':'.$request->getPort() : ''),
                    'x-forwarded-proto' => $request->getScheme(),
                ])
                ->get("{$serviceUrl}/api/assets/{$asset}");
        } catch (ConnectionException $exception) {
            return response()->json([
                'ok' => false,
                'error' => 'Could not reach the converter asset service.',
            ], 502);
        }

        if (! $response->successful()) {
            return response()->json([
                'ok' => false,
                'error' => 'Asset not found.',
            ], $response->status());
        }

        return response()->stream(function () use ($response): void {
            echo $response->body();
        }, 200, [
            'Content-Type' => $response->header('Content-Type', 'application/octet-stream'),
            'Cache-Control' => $response->header('Cache-Control', 'public, max-age=3600'),
        ]);
    }

    private function resolveApiKey(Request $request): ?ApiKey
    {
        $token = trim((string) $request->header('x-api-key', ''));
        if ($token === '') {
            return null;
        }

        return ApiKey::query()
            ->where('key_hash', hash('sha256', $token))
            ->whereNull('revoked_at')
            ->first();
    }

    private function invalidApiKeyResponse(): JsonResponse
    {
        return response()->json([
            'ok' => false,
            'error' => 'A valid API key is required.',
        ], 401);
    }
}
