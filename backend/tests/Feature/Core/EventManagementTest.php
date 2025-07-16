<?php

namespace Tests\Feature\Core;

use App\Models\Core\Event;
use App\Models\Core\EventRsvp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EventManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $hostUser;
    protected User $attendeeUser;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::firstOrCreate(['name' => 'user']);

        // Create test users
        $this->hostUser = User::factory()->create();
        $this->hostUser->assignRole('user');

        $this->attendeeUser = User::factory()->create();
        $this->attendeeUser->assignRole('user');

        $this->regularUser = User::factory()->create();
        $this->regularUser->assignRole('user');
    }

    /** @test */
    public function authenticated_user_can_get_events_list()
    {
        Sanctum::actingAs($this->regularUser);

        // Create test events
        Event::factory()->count(3)->create([
            'host_id' => $this->hostUser->id,
            'is_public' => true,
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/v1/core/events');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'title',
                            'description',
                            'start_date',
                            'end_date',
                            'location',
                            'capacity',
                            'price',
                            'category',
                            'is_public',
                            'status',
                            'host_id',
                            'created_at',
                            'updated_at',
                        ]
                    ],
                    'current_page',
                    'per_page',
                    'total',
                ]
            ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_events()
    {
        $response = $this->getJson('/api/v1/core/events');

        $response->assertStatus(401);
    }

    /** @test */
    public function user_can_search_events()
    {
        Sanctum::actingAs($this->regularUser);

        Event::factory()->create([
            'host_id' => $this->hostUser->id,
            'title' => 'Amazing Concert Event',
            'is_public' => true,
            'status' => 'published',
        ]);

        Event::factory()->create([
            'host_id' => $this->hostUser->id,
            'title' => 'Sports Tournament',
            'is_public' => true,
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/v1/core/events/search?q=concert');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Amazing Concert Event', $data[0]['title']);
    }

    /** @test */
    public function user_can_filter_events_by_category()
    {
        Sanctum::actingAs($this->regularUser);

        Event::factory()->create([
            'host_id' => $this->hostUser->id,
            'title' => 'Music Event',
            'category' => 'music',
            'is_public' => true,
            'status' => 'published',
        ]);

        Event::factory()->create([
            'host_id' => $this->hostUser->id,
            'title' => 'Sports Event',
            'category' => 'sports',
            'is_public' => true,
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/v1/core/events?category=music');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Music Event', $data[0]['title']);
    }

    /** @test */
    public function user_can_create_event()
    {
        Sanctum::actingAs($this->hostUser);
        Storage::fake('s3');

        $eventData = [
            'title' => 'New Community Event',
            'description' => 'A great community gathering',
            'start_date' => '2024-03-15 10:00:00',
            'end_date' => '2024-03-15 16:00:00',
            'location' => 'Community Center',
            'address' => '123 Main St, City, State',
            'capacity' => 100,
            'price' => 25.00,
            'category' => 'community',
            'is_public' => true,
            'tags' => ['community', 'networking', 'fun'],
        ];

        $response = $this->postJson('/api/v1/core/events', $eventData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'title',
                    'description',
                    'start_date',
                    'end_date',
                    'location',
                    'capacity',
                    'price',
                    'category',
                    'is_public',
                    'status',
                    'host_id',
                ]
            ]);

        $this->assertDatabaseHas('events', [
            'title' => 'New Community Event',
            'host_id' => $this->hostUser->id,
            'capacity' => 100,
            'price' => 25.00,
            'status' => 'draft', // Default status
        ]);
    }

    /** @test */
    public function event_creation_validates_required_fields()
    {
        Sanctum::actingAs($this->hostUser);

        $response = $this->postJson('/api/v1/core/events', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'title',
                'description',
                'start_date',
                'end_date',
                'location',
                'category',
            ]);
    }

    /** @test */
    public function event_creation_validates_date_logic()
    {
        Sanctum::actingAs($this->hostUser);

        $eventData = [
            'title' => 'Invalid Date Event',
            'description' => 'Test event',
            'start_date' => '2024-03-15 16:00:00',
            'end_date' => '2024-03-15 10:00:00', // End before start
            'location' => 'Test Location',
            'category' => 'test',
        ];

        $response = $this->postJson('/api/v1/core/events', $eventData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    }

    /** @test */
    public function user_can_get_specific_event()
    {
        Sanctum::actingAs($this->regularUser);

        $event = Event::factory()->create([
            'host_id' => $this->hostUser->id,
            'title' => 'Specific Event',
            'is_public' => true,
            'status' => 'published',
        ]);

        $response = $this->getJson("/api/v1/core/events/{$event->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $event->id,
                    'title' => 'Specific Event',
                ]
            ]);
    }

    /** @test */
    public function user_can_rsvp_to_event()
    {
        Sanctum::actingAs($this->attendeeUser);

        $event = Event::factory()->create([
            'host_id' => $this->hostUser->id,
            'capacity' => 50,
            'is_public' => true,
            'status' => 'published',
        ]);

        $rsvpData = [
            'status' => 'going',
            'notes' => 'Looking forward to this event!',
        ];

        $response = $this->postJson("/api/v1/core/events/{$event->id}/rsvp", $rsvpData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'event_id',
                    'user_id',
                    'status',
                    'notes',
                ]
            ]);

        $this->assertDatabaseHas('event_rsvps', [
            'event_id' => $event->id,
            'user_id' => $this->attendeeUser->id,
            'status' => 'going',
        ]);
    }

    /** @test */
    public function user_can_update_rsvp_status()
    {
        Sanctum::actingAs($this->attendeeUser);

        $event = Event::factory()->create([
            'host_id' => $this->hostUser->id,
            'is_public' => true,
            'status' => 'published',
        ]);

        // First RSVP
        EventRsvp::create([
            'event_id' => $event->id,
            'user_id' => $this->attendeeUser->id,
            'status' => 'interested',
        ]);

        $updateData = [
            'status' => 'going',
            'notes' => 'Changed my mind, definitely going!',
        ];

        $response = $this->postJson("/api/v1/core/events/{$event->id}/rsvp", $updateData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('event_rsvps', [
            'event_id' => $event->id,
            'user_id' => $this->attendeeUser->id,
            'status' => 'going',
        ]);
    }

    /** @test */
    public function user_can_cancel_rsvp()
    {
        Sanctum::actingAs($this->attendeeUser);

        $event = Event::factory()->create([
            'host_id' => $this->hostUser->id,
            'is_public' => true,
            'status' => 'published',
        ]);

        EventRsvp::create([
            'event_id' => $event->id,
            'user_id' => $this->attendeeUser->id,
            'status' => 'going',
        ]);

        $response = $this->deleteJson("/api/v1/core/events/{$event->id}/rsvp");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('event_rsvps', [
            'event_id' => $event->id,
            'user_id' => $this->attendeeUser->id,
        ]);
    }

    /** @test */
    public function user_cannot_rsvp_to_full_event()
    {
        Sanctum::actingAs($this->attendeeUser);

        $event = Event::factory()->create([
            'host_id' => $this->hostUser->id,
            'capacity' => 1,
            'is_public' => true,
            'status' => 'published',
        ]);

        // Fill the event to capacity
        EventRsvp::create([
            'event_id' => $event->id,
            'user_id' => $this->regularUser->id,
            'status' => 'going',
        ]);

        $rsvpData = [
            'status' => 'going',
        ];

        $response = $this->postJson("/api/v1/core/events/{$event->id}/rsvp", $rsvpData);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Event is at full capacity',
            ]);
    }

    /** @test */
    public function user_can_get_event_attendees()
    {
        Sanctum::actingAs($this->hostUser);

        $event = Event::factory()->create([
            'host_id' => $this->hostUser->id,
            'is_public' => true,
            'status' => 'published',
        ]);

        EventRsvp::create([
            'event_id' => $event->id,
            'user_id' => $this->attendeeUser->id,
            'status' => 'going',
        ]);

        $response = $this->getJson("/api/v1/core/events/{$event->id}/attendees");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'user_id',
                            'status',
                            'user' => [
                                'id',
                                'name',
                                'email',
                            ]
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function host_can_update_their_event()
    {
        Sanctum::actingAs($this->hostUser);

        $event = Event::factory()->create([
            'host_id' => $this->hostUser->id,
            'title' => 'Original Title',
        ]);

        $updateData = [
            'title' => 'Updated Event Title',
            'description' => 'Updated description',
        ];

        $response = $this->putJson("/api/v1/core/events/{$event->id}", $updateData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Event Title',
        ]);
    }

    /** @test */
    public function user_cannot_update_others_event()
    {
        Sanctum::actingAs($this->regularUser);

        $event = Event::factory()->create([
            'host_id' => $this->hostUser->id,
            'title' => 'Original Title',
        ]);

        $updateData = [
            'title' => 'Unauthorized Update',
        ];

        $response = $this->putJson("/api/v1/core/events/{$event->id}", $updateData);

        $response->assertStatus(403);
    }

    /** @test */
    public function host_can_delete_their_event()
    {
        Sanctum::actingAs($this->hostUser);

        $event = Event::factory()->create([
            'host_id' => $this->hostUser->id,
        ]);

        $response = $this->deleteJson("/api/v1/core/events/{$event->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('events', [
            'id' => $event->id,
        ]);
    }

    /** @test */
    public function user_gets_404_for_nonexistent_event()
    {
        Sanctum::actingAs($this->regularUser);

        $response = $this->getJson('/api/v1/core/events/999');

        $response->assertStatus(404);
    }
}
