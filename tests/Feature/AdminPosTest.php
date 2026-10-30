<?php

namespace Tests\Feature;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentType;
use App\Enums\PosShiftStatus;
use App\Enums\ProductStatus;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\PosHold;
use App\Models\PosRegister;
use App\Models\PosShift;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Store;
use App\Models\User;
use App\Services\PosShiftService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminPosTest extends TestCase
{
    use RefreshDatabase;

    public function test_customers_cannot_open_the_pos(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)
            ->get(route('admin.pos.index'))
            ->assertForbidden();
    }

    public function test_staff_cannot_sell_without_an_open_shift(): void
    {
        $admin = User::factory()->admin()->create();
        $variant = $this->sellableVariant(stock: 2, price: 1000);

        $this->actingAs($admin)
            ->post(route('admin.pos.store'), [
                'items' => [
                    ['variant_id' => $variant->id, 'quantity' => 1],
                ],
                'discount_type' => 'none',
                'payment_method' => PaymentMethod::Cash->value,
                'amount_tendered' => 1000,
            ])
            ->assertSessionHasErrors('shift');

        $this->assertSame(0, Order::query()->count());
        $this->assertSame(2, $variant->fresh()?->stock);
    }

    public function test_staff_can_sell_to_a_walk_in_customer(): void
    {
        $admin = User::factory()->admin()->create();
        $this->openShift($admin);
        $variant = $this->sellableVariant(stock: 4, price: 2000);

        $this->actingAs($admin)
            ->post(route('admin.pos.store'), [
                'items' => [
                    ['variant_id' => $variant->id, 'quantity' => 2],
                ],
                'customer_name' => 'Walk-in Guest',
                'customer_phone' => '01700000000',
                'discount_type' => 'amount',
                'discount_value' => 500,
                'payment_method' => PaymentMethod::Cash->value,
                'amount_tendered' => 4000,
            ])
            ->assertRedirect();

        $order = Order::query()->firstOrFail();

        $this->assertSame(OrderSource::Pos, $order->source);
        $this->assertSame(OrderStatus::Delivered, $order->status);
        $this->assertNull($order->user_id);
        $this->assertNotNull($order->store_customer_id);
        $this->assertSame($admin->id, $order->cashier_id);
        $this->assertSame('Walk-in Guest', $order->shipping_name);
        $this->assertEquals(4000.0, (float) $order->subtotal);
        $this->assertEquals(500.0, (float) $order->discount_amount);
        $this->assertEquals(3500.0, (float) $order->total);
        $this->assertEquals(4000.0, (float) $order->amount_tendered);
        $this->assertEquals(500.0, (float) $order->change_due);
        $this->assertSame(2, $variant->fresh()?->stock);

        $this->actingAs($admin)
            ->get(route('admin.pos.receipt', $order))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/pos/receipt')
                ->where('order.number', $order->number)
                ->where('order.customer.email', 'Walk-in')
            );
    }

    public function test_staff_can_scan_a_sku_and_take_card_or_bkash(): void
    {
        $admin = User::factory()->admin()->create();
        $this->openShift($admin);
        $variant = $this->sellableVariant(stock: 3, price: 1500);

        $this->actingAs($admin)
            ->get(route('admin.pos.lookup', ['sku' => $variant->sku]))
            ->assertOk()
            ->assertJsonPath('item.variant_id', $variant->id)
            ->assertJsonPath('item.sku', $variant->sku);

        $this->actingAs($admin)
            ->post(route('admin.pos.store'), [
                'items' => [
                    ['variant_id' => $variant->id, 'quantity' => 1],
                ],
                'discount_type' => 'none',
                'payment_method' => PaymentMethod::Bkash->value,
            ])
            ->assertRedirect();

        $order = Order::query()->firstOrFail();
        $this->assertSame(PaymentMethod::Bkash, $order->payment_method);
        $this->assertEquals(1500.0, (float) $order->amount_tendered);
        $this->assertEquals(0.0, (float) $order->change_due);
    }

    public function test_staff_can_return_a_pos_sale_and_restore_stock(): void
    {
        $admin = User::factory()->admin()->create();
        $this->openShift($admin);
        $variant = $this->sellableVariant(stock: 5, price: 3000);

        $this->actingAs($admin)
            ->post(route('admin.pos.store'), [
                'items' => [
                    ['variant_id' => $variant->id, 'quantity' => 2],
                ],
                'discount_type' => 'percent',
                'discount_value' => 10,
                'payment_method' => PaymentMethod::Card->value,
            ])
            ->assertRedirect();

        $order = Order::query()->with('items')->firstOrFail();
        $this->assertEquals(5400.0, (float) $order->total);
        $this->assertSame(3, $variant->fresh()?->stock);

        $this->actingAs($admin)
            ->post(route('admin.orders.returns.store', $order), [
                'items' => [
                    ['order_item_id' => $order->items->first()?->id, 'quantity' => 2],
                ],
                'refund_method' => PaymentMethod::Card->value,
                'reason' => 'Wrong size',
                'from_returns' => true,
            ])
            ->assertRedirect(route('admin.returns.show', $order));

        $order->refresh();
        $this->assertSame(OrderStatus::Refunded, $order->status);
        $this->assertEquals(5400.0, (float) $order->refunded_amount);
        $this->assertSame(5, $variant->fresh()?->stock);
    }

    public function test_returns_menu_lists_a_pos_sale(): void
    {
        $admin = User::factory()->admin()->create();
        $this->openShift($admin);
        $variant = $this->sellableVariant(stock: 2, price: 1000);

        $this->actingAs($admin)
            ->post(route('admin.pos.store'), [
                'items' => [
                    ['variant_id' => $variant->id, 'quantity' => 1],
                ],
                'discount_type' => 'none',
                'payment_method' => PaymentMethod::Cash->value,
                'amount_tendered' => 1000,
            ])
            ->assertRedirect();

        $order = Order::query()->firstOrFail();

        $this->actingAs($admin)
            ->get(route('admin.returns.index'))
            ->assertOk()
            ->assertSee($order->number);

        $this->actingAs($admin)
            ->get(route('admin.returns.show', $order))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/returns/show')
                ->where('order.number', $order->number)
                ->has('payment_methods')
            );
    }

    public function test_cash_sale_requires_enough_tendered(): void
    {
        $admin = User::factory()->admin()->create();
        $this->openShift($admin);
        $variant = $this->sellableVariant(stock: 2, price: 1000);

        $this->actingAs($admin)
            ->post(route('admin.pos.store'), [
                'items' => [
                    ['variant_id' => $variant->id, 'quantity' => 1],
                ],
                'discount_type' => 'none',
                'payment_method' => PaymentMethod::Cash->value,
                'amount_tendered' => 200,
            ])
            ->assertSessionHasErrors('amount_tendered');

        $this->assertSame(2, $variant->fresh()?->stock);
        $this->assertSame(0, Order::query()->count());
    }

    public function test_staff_can_scan_a_barcode_and_park_a_sale(): void
    {
        $admin = User::factory()->admin()->create();
        $this->openShift($admin);
        $variant = $this->sellableVariant(stock: 3, price: 1200);

        $this->actingAs($admin)
            ->get(route('admin.pos.lookup', ['code' => $variant->barcode]))
            ->assertOk()
            ->assertJsonPath('item.variant_id', $variant->id);

        $this->actingAs($admin)
            ->post(route('admin.pos.holds.store'), [
                'items' => [
                    [
                        'variant_id' => $variant->id,
                        'quantity' => 1,
                        'discount_type' => 'amount',
                        'discount_value' => 200,
                    ],
                ],
                'customer_name' => 'Nabila',
                'customer_phone' => '01811111111',
                'discount_type' => 'none',
            ])
            ->assertRedirect(route('admin.pos.index'));

        $hold = PosHold::query()->firstOrFail();
        $this->assertSame(3, $variant->fresh()?->stock);
        $this->assertSame('Nabila', $hold->customer_name);

        $this->actingAs($admin)
            ->get(route('admin.pos.index', ['hold' => $hold->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/pos/index')
                ->where('resume.id', $hold->id)
                ->has('resume.items', 1)
            );
    }

    public function test_staff_can_apply_a_line_discount_and_find_a_saved_customer(): void
    {
        $admin = User::factory()->admin()->create();
        $this->openShift($admin);
        $variant = $this->sellableVariant(stock: 2, price: 2000);

        $this->actingAs($admin)
            ->post(route('admin.pos.store'), [
                'items' => [
                    [
                        'variant_id' => $variant->id,
                        'quantity' => 1,
                        'discount_type' => 'amount',
                        'discount_value' => 300,
                    ],
                ],
                'customer_name' => 'Rafi',
                'customer_phone' => '01922222222',
                'discount_type' => 'none',
                'payment_method' => PaymentMethod::Card->value,
            ])
            ->assertRedirect();

        $order = Order::query()->with('items')->firstOrFail();
        $this->assertEquals(1700.0, (float) $order->total);
        $this->assertEquals(300.0, (float) $order->items->first()?->discount_amount);
        $this->assertDatabaseHas('store_customers', [
            'phone' => '01922222222',
            'name' => 'Rafi',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.pos.customers', ['q' => '01922']))
            ->assertOk()
            ->assertJsonPath('customers.0.phone', '01922222222');
    }

    public function test_staff_can_exchange_a_pos_item_for_another(): void
    {
        $admin = User::factory()->admin()->create();
        $this->openShift($admin);
        $originalVariant = $this->sellableVariant(stock: 2, price: 4000);
        $replacement = $this->sellableVariant(stock: 2, price: 2500);

        $this->actingAs($admin)
            ->post(route('admin.pos.store'), [
                'items' => [
                    ['variant_id' => $originalVariant->id, 'quantity' => 1],
                ],
                'discount_type' => 'none',
                'payment_method' => PaymentMethod::Cash->value,
                'amount_tendered' => 4000,
            ])
            ->assertRedirect();

        $original = Order::query()->with('items')->firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.pos.exchange', $original), [
                'return_items' => [
                    ['order_item_id' => $original->items->first()?->id, 'quantity' => 1],
                ],
                'items' => [
                    ['variant_id' => $replacement->id, 'quantity' => 1],
                ],
                'discount_type' => 'none',
                'payment_method' => PaymentMethod::Cash->value,
            ])
            ->assertRedirect();

        $exchange = Order::query()->where('id', '!=', $original->id)->firstOrFail();
        $this->assertSame($original->id, $exchange->exchanged_from_order_id);
        $this->assertEquals(2500.0, (float) $exchange->total);
        $this->assertEquals(2500.0, (float) $exchange->exchange_credit);
        $this->assertSame(2, $originalVariant->fresh()?->stock);
        $this->assertSame(1, $replacement->fresh()?->stock);
        $this->assertEquals(1500.0, (float) $original->fresh()?->refunded_amount);
    }

    public function test_staff_can_split_a_payment_and_apply_store_vat(): void
    {
        $admin = User::factory()->admin()->create();
        $this->openShift($admin);
        Store::query()->firstOrFail()->update(['tax_rate' => 15]);
        $variant = $this->sellableVariant(stock: 2, price: 2000);

        $this->actingAs($admin)
            ->post(route('admin.pos.store'), [
                'items' => [
                    ['variant_id' => $variant->id, 'quantity' => 1],
                ],
                'discount_type' => 'none',
                'payments' => [
                    [
                        'method' => PaymentMethod::Cash->value,
                        'amount' => 800,
                        'amount_tendered' => 1000,
                    ],
                    [
                        'method' => PaymentMethod::Bkash->value,
                        'amount' => 1500,
                    ],
                ],
            ])
            ->assertRedirect();

        $order = Order::query()->with('payments')->firstOrFail();
        $this->assertEquals(300.0, (float) $order->tax_amount);
        $this->assertEquals(2300.0, (float) $order->total);
        $this->assertSame(PaymentMethod::Cash, $order->payment_method);
        $this->assertEquals(2500.0, (float) $order->amount_tendered);
        $this->assertEquals(200.0, (float) $order->change_due);
        $this->assertCount(2, $order->payments);
        $this->assertEquals(800.0, (float) $order->payments->firstWhere('method', PaymentMethod::Cash)?->amount);
        $this->assertEquals(1500.0, (float) $order->payments->firstWhere('method', PaymentMethod::Bkash)?->amount);
    }

    public function test_staff_can_close_a_shift_with_expected_cash(): void
    {
        $admin = User::factory()->admin()->create();
        $shift = $this->openShift($admin, 5000);
        $variant = $this->sellableVariant(stock: 2, price: 2000);

        $this->actingAs($admin)
            ->post(route('admin.pos.store'), [
                'items' => [
                    ['variant_id' => $variant->id, 'quantity' => 1],
                ],
                'discount_type' => 'none',
                'payment_method' => PaymentMethod::Cash->value,
                'amount_tendered' => 2000,
            ])
            ->assertRedirect();

        $this->actingAs($admin)
            ->patch(route('admin.pos.shifts.update', $shift), [
                'counted_cash' => 6900,
                'notes' => 'Short 100',
            ])
            ->assertRedirect(route('admin.pos.reports.index', ['shift' => $shift->id]));

        $shift->refresh();
        $this->assertSame(PosShiftStatus::Closed, $shift->status);
        $this->assertEquals(7000.0, (float) $shift->expected_cash);
        $this->assertEquals(6900.0, (float) $shift->counted_cash);
        $this->assertEquals(-100.0, (float) $shift->difference);
        $this->assertSame(1, OrderPayment::query()->where('type', PaymentType::Sale)->count());
    }

    public function test_daily_pos_report_summarises_sales(): void
    {
        $admin = User::factory()->admin()->create();
        $this->openShift($admin);
        $variant = $this->sellableVariant(stock: 2, price: 1800);

        $this->actingAs($admin)
            ->post(route('admin.pos.store'), [
                'items' => [
                    ['variant_id' => $variant->id, 'quantity' => 1],
                ],
                'discount_type' => 'none',
                'payment_method' => PaymentMethod::Card->value,
            ])
            ->assertRedirect();

        $this->actingAs($admin)
            ->get(route('admin.pos.reports.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/pos/reports')
                ->where('summary.tickets', 1)
                ->where('summary.sales', 1800)
                ->where('summary.net', 1800)
            );
    }

    public function test_admin_orders_can_be_filtered_by_pos_source(): void
    {
        $admin = User::factory()->admin()->create();
        $online = Order::factory()->create(['source' => OrderSource::Online]);
        $pos = Order::factory()->create([
            'source' => OrderSource::Pos,
            'status' => OrderStatus::Delivered,
            'user_id' => null,
            'shipping_name' => 'Walk-in Customer',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.orders.index', ['source' => 'pos']))
            ->assertOk()
            ->assertSee($pos->number)
            ->assertDontSee($online->number);
    }

    private function openShift(User $cashier, float $openingCash = 5000): PosShift
    {
        $register = PosRegister::query()->firstOrFail();

        return app(PosShiftService::class)->open($cashier, [
            'register_id' => $register->id,
            'opening_cash' => $openingCash,
        ]);
    }

    private function sellableVariant(int $stock, int $price): ProductVariant
    {
        $product = Product::factory()->create(['status' => ProductStatus::Live]);

        return ProductVariant::factory()->create([
            'product_id' => $product->id,
            'stock' => $stock,
            'price' => $price,
        ]);
    }
}
