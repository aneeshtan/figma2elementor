<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_the_documentation_page_returns_a_successful_response(): void
    {
        $response = $this->get('/docs');

        $response
            ->assertStatus(200)
            ->assertSee('Figma2Element')
            ->assertSee('Quick Start');
    }

    public function test_the_privacy_page_returns_a_successful_response(): void
    {
        $response = $this->get('/privacy');

        $response
            ->assertStatus(200)
            ->assertSee('How the Figma plugin handles data')
            ->assertSee('Figma2Element');
    }

    public function test_the_support_page_returns_a_successful_response(): void
    {
        $response = $this->get('/support');

        $response
            ->assertStatus(200)
            ->assertSee('How to get help')
            ->assertSee('info@ctrlaltl.com');
    }

    public function test_the_support_form_submits_to_the_configured_email(): void
    {
        $response = $this->post('/support', [
            'name' => 'Farshad',
            'email' => 'farshad@example.com',
            'subject' => 'Plugin issue',
            'message' => 'The plugin needs help.',
        ]);

        $response
            ->assertRedirect('/support')
            ->assertSessionHas('status');
    }
}
