<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\View\View;
use Throwable;

class SupportController extends Controller
{
    public function show(): View
    {
        return view('legal.support');
    }

    public function submit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'subject' => ['required', 'string', 'max:160'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $body = implode("\n\n", [
            'New support request from Figma2Element',
            'Name: '.$validated['name'],
            'Email: '.$validated['email'],
            'Subject: '.$validated['subject'],
            'Message:',
            trim($validated['message']),
        ]);

        try {
            Mail::raw($body, function ($message) use ($validated): void {
                $message
                    ->to('info@ctrlaltl.com')
                    ->replyTo($validated['email'], $validated['name'])
                    ->subject('[Figma2Element Support] '.$validated['subject']);
            });
        } catch (Throwable $error) {
            return back()
                ->withInput()
                ->withErrors([
                    'support' => 'The support form could not send your message right now. Email info@ctrlaltl.com directly.',
                ]);
        }

        return redirect()
            ->route('support')
            ->with('status', 'Your message was sent to info@ctrlaltl.com.');
    }
}
