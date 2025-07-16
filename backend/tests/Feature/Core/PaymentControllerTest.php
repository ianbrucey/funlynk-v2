<?php

namespace Tests\Feature\Core;

use App\Models\Core\Event;
use App\Models\Core\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class PaymentControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock Stripe to avoid actual API calls in tests
        config(['services.stripe.secret' => 'sk_test_mock_key']);
    }

    public function test_payment_history_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/core/payments/history');
        
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_view_payment_history(): void
    {
        $user = User::factory()->create();
        $payment = Payment::factory()->for($user)->create();
        
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/core/payments/history');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'pagination'
            ]);
    }

    public function test_create_payment_intent_requires_authentication(): void
    {
        $event = Event::factory()->create();
        
        $response = $this->postJson("/api/v1/core/payments/events/{$event->id}/payment-intent", [
            'payment_method_id' => 'pm_test_card',
        ]);
        
        $response->assertStatus(401);
    }

    public function test_confirm_payment_requires_authentication(): void
    {
        $response = $this->postJson('/api/v1/core/payments/confirm', [
            'payment_intent_id' => 'pi_test_intent',
        ]);
        
        $response->assertStatus(401);
    }

    public function test_request_refund_requires_authentication(): void
    {
        $payment = Payment::factory()->create();
        
        $response = $this->postJson("/api/v1/core/payments/{$payment->id}/refund", [
            'reason' => 'Test refund',
        ]);
        
        $response->assertStatus(401);
    }
}
