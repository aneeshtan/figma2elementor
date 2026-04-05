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
            ->assertSee('support@figma2elementor.ctrlaltl.com');
    }
}
