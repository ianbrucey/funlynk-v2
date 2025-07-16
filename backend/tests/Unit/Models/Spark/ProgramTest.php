<?php

namespace Tests\Unit\Models\Spark;

use App\Models\Spark\District;
use App\Models\Spark\Program;
use App\Models\Spark\School;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_calculate_popularity_score()
    {
        $program = Program::factory()->hasBookings(10, ['status' => 'completed', 'rating' => 5])->create();

        $expectedScore = (10 * 0.4) + (5 * 0.4) + (10 * 0.2);
        $this->assertEquals($expectedScore, $program->popularity_score);
    }

    /** @test */
    public function it_can_return_next_available_date()
    {
        $program = Program::factory()->hasAvailability(3, ['date' => '2023-10-12', 'is_available' => true, 'current_bookings' => 1, 'max_bookings' => 5])->create();

        $this->assertEquals('2023-10-12', $program->next_available_date);
    }

    /** @test */
    public function it_can_return_total_revenue()
    {
        $program = Program::factory()->hasBookings(5, ['status' => 'completed', 'total_cost' => 100.00])->create();

        $this->assertEquals(500.00, $program->total_revenue);
    }

    /** @test */
    public function it_has_district_relationship()
    {
        $district = District::factory()->create();
        $program = Program::factory()->create();

        $program->districts()->attach($district);

        $this->assertTrue($program->districts()->exists());
    }

    /** @test */
    public function it_has_school_relationship()
    {
        $school = School::factory()->create();
        $program = Program::factory()->create();

        $program->schools()->attach($school);

        $this->assertTrue($program->schools()->exists());
    }
}
