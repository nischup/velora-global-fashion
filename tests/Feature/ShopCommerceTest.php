<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ShopCommerceTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_add_items_to_the_cart(): void
    {
        $variant = $this->sellableVariant(stock: 5, price: 1200);

        $this->post(route('cart.store'), [
            'variant_id' => $variant->id,
            'quantity' => 2,
        ])->assertRedirect();

        $this->get(route('cart.index'))
            ->assertOk()
            ->assertSee($variant->product->name)
            ->assertSee('৳2,400');
    }

    public function test_guests_can_save_products_to_the_wishlist(): void
    {
        $product = Product::factory()->create(['name' => 'Silk Wrap Dress']);
        ProductVariant::factory()->create(['product_id' => $product->id]);

        $this->post(route('wishlist.store'), [
            'product_id' => $product->id,
        ])->assertRedirect();

        $this->get(route('wishlist.index'))
            ->assertOk()
            ->assertSee('Silk Wrap Dress');
    }

    public function test_customers_can_place_an_order_and_view_it_in_their_account(): void
    {
        $customer = User::factory()->create();
        $variant = $this->sellableVariant(stock: 4, price: 2500);

        $response = $this->actingAs($customer)
            ->withSession(['cart' => [$variant->id => 2]])
            ->post(route('checkout.store'), [
                'shipping_name' => 'Amina Rahman',
                'shipping_phone' => '01711111111',
                'shipping_address' => '12 Gulshan Avenue',
                'shipping_city' => 'Dhaka',
            ]);

        $order = Order::query()->firstOrFail();

        $response->assertRedirect(route('account.orders.show', $order));
        $this->assertSame(2, $order->items()->sum('quantity'));
        $this->assertSame(2, $variant->fresh()?->stock);
        $this->assertSame(UserRole::Customer, $customer->role);

        $this->actingAs($customer)
            ->get(route('account.orders.index'))
            ->assertOk()
            ->assertSee($order->number);

        $this->actingAs($customer)
            ->get(route('account.orders.show', $order))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('account/orders/show')
                ->where('order.number', $order->number)
                ->where('order.shipping_name', 'Amina Rahman')
                ->has('order.items', 1)
                ->where('order.items.0.product_name', $variant->product->name)
            );
    }

    public function test_customers_cannot_view_another_customers_order(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $owner->id]);
        OrderItem::factory()->create(['order_id' => $order->id]);

        $this->actingAs($other)
            ->get(route('account.orders.show', $order))
            ->assertForbidden();
    }

    public function test_customers_are_sent_to_the_account_panel_not_admin(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)
            ->get(route('dashboard'))
            ->assertRedirect(route('account.index'));

        $this->actingAs($customer)
            ->get(route('admin.orders.index'))
            ->assertForbidden();

        $this->actingAs($customer)
            ->get(route('account.index'))
            ->assertOk()
            ->assertSee('Welcome back');
    }

    public function test_admin_orders_default_to_today_and_can_filter_by_date_range(): void
    {
        $this->freezeTime();

        $admin = User::factory()->admin()->create();
        $today = Order::factory()->create(['number' => 'VGF-TODAY-1']);
        $yesterday = Order::factory()->create(['number' => 'VGF-YDAY-1']);
        $yesterday->forceFill([
            'created_at' => now()->subDay()->setTime(12, 0),
            'updated_at' => now()->subDay()->setTime(12, 0),
        ])->saveQuietly();

        $this->actingAs($admin)
            ->get(route('admin.orders.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/orders/index')
                ->where('filters.from', now()->toDateString())
                ->where('filters.to', now()->toDateString())
                ->has('orders.data', 1)
                ->where('orders.data.0.number', $today->number));

        $this->actingAs($admin)
            ->get('/admin/orders?'.http_build_query([
                'from' => now()->subDay()->toDateString(),
                'to' => now()->toDateString(),
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.from', now()->subDay()->toDateString())
                ->where('filters.to', now()->toDateString())
                ->has('orders.data', 2)
                ->where('orders.data.0.number', $today->number)
                ->where('orders.data.1.number', $yesterday->number));
    }

    public function test_admins_can_manage_orders_in_the_admin_panel(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create(['status' => OrderStatus::Pending]);
        OrderItem::factory()->create(['order_id' => $order->id]);

        $this->actingAs($admin)
            ->get(route('admin.orders.index'))
            ->assertOk()
            ->assertSee($order->number);

        $this->actingAs($admin)
            ->patch(route('admin.orders.update', $order), [
                'status' => OrderStatus::Processing->value,
            ])
            ->assertRedirect();

        $this->assertSame(OrderStatus::Processing, $order->fresh()?->status);
    }

    public function test_admins_can_bulk_update_open_orders(): void
    {
        $admin = User::factory()->admin()->create();
        $first = Order::factory()->create(['status' => OrderStatus::Pending]);
        $second = Order::factory()->create(['status' => OrderStatus::Pending]);
        $closed = Order::factory()->create(['status' => OrderStatus::Delivered]);

        $this->actingAs($admin)
            ->post(route('admin.orders.bulk'), [
                'order_ids' => [$first->id, $second->id, $closed->id],
                'status' => OrderStatus::Processing->value,
            ])
            ->assertRedirect();

        $this->assertSame(OrderStatus::Processing, $first->fresh()?->status);
        $this->assertSame(OrderStatus::Processing, $second->fresh()?->status);
        $this->assertSame(OrderStatus::Delivered, $closed->fresh()?->status);
    }

    public function test_admin_can_print_an_online_order_invoice(): void
    {
        $admin = User::factory()->admin()->create();
        $order = Order::factory()->create();
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_name' => 'Cotton Safari Jacket',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.orders.invoice', $order))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/orders/invoice')
                ->where('order.number', $order->number)
                ->where('order.items.0.product_name', 'Cotton Safari Jacket'));
    }

    public function test_customers_cannot_print_admin_invoices(): void
    {
        $customer = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $customer->id]);

        $this->actingAs($customer)
            ->get(route('admin.orders.invoice', $order))
            ->assertForbidden();
    }

    public function test_new_registrations_are_customers(): void
    {
        $this->post(route('register.store'), [
            'name' => 'New Customer',
            'email' => 'new-customer@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'new-customer@example.com',
            'role' => UserRole::Customer->value,
        ]);
    }

    private function sellableVariant(int $stock, int $price): ProductVariant
    {
        $product = Product::factory()->create();

        return ProductVariant::factory()->create([
            'product_id' => $product->id,
            'stock' => $stock,
            'price' => $price,
        ]);
    }
}
