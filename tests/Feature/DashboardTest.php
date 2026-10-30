<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_customers_are_redirected_to_their_account()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->get(route('dashboard'))
            ->assertRedirect(route('account.index'));
    }

    public function test_staff_can_visit_the_admin_dashboard()
    {
        $user = User::factory()->admin()->create();
        $this->actingAs($user);

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->has('stats', fn (Assert $stats) => $stats
                    ->has('orders')
                    ->has('products')
                    ->has('live_products')
                    ->has('low_stock')
                    ->has('categories')));
    }
}
