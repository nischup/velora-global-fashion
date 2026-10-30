<?php

namespace Tests\Feature;

use App\Models\CatalogSale;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminCatalogSaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_an_all_items_sale(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.sales.store'), [
                'name' => 'Winter Sale',
                'percent' => 70,
                'applies_to' => 'all',
                'is_active' => true,
            ])
            ->assertRedirect(route('admin.sales.index'));

        $this->assertDatabaseHas('catalog_sales', [
            'name' => 'Winter Sale',
            'percent' => 70,
            'applies_to' => 'all',
            'is_active' => true,
        ]);
    }

    public function test_storefront_and_cart_use_the_sale_price(): void
    {
        $product = Product::factory()->create(['name' => 'Wool Coat']);
        ProductVariant::factory()->create([
            'product_id' => $product->id,
            'price' => 10000,
            'stock' => 5,
        ]);
        CatalogSale::factory()->create([
            'name' => 'Winter Sale',
            'percent' => 70,
            'is_active' => true,
        ]);

        $this->get(route('products.show', $product))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('shop/show')
                ->where('product.variants.0.price', 3000)
                ->where('product.variants.0.compare_at_price', 10000)
                ->where('product.variants.0.sale_percent', 70));

        $variant = $product->variants()->firstOrFail();

        $this->post(route('cart.store'), [
            'variant_id' => $variant->id,
            'quantity' => 1,
        ])->assertRedirect();

        $this->get(route('cart.index'))
            ->assertOk()
            ->assertSee('৳3,000');
    }

    public function test_selected_sale_does_not_discount_other_products(): void
    {
        $onSale = Product::factory()->create();
        $fullPrice = Product::factory()->create();
        ProductVariant::factory()->create(['product_id' => $onSale->id, 'price' => 2000]);
        ProductVariant::factory()->create(['product_id' => $fullPrice->id, 'price' => 2000]);

        $sale = CatalogSale::factory()->selected()->create(['percent' => 50]);
        $sale->products()->attach($onSale->id);

        $this->get(route('products.show', $onSale))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('product.variants.0.price', 1000));

        $this->get(route('products.show', $fullPrice))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('product.variants.0.price', 2000)
                ->where('product.variants.0.sale_percent', null));
    }

    public function test_sales_index_lists_selected_product_names(): void
    {
        $admin = User::factory()->admin()->create();
        $jacket = Product::factory()->create(['name' => 'Cotton Safari Jacket']);
        $dress = Product::factory()->create(['name' => 'Silk Wrap Dress']);
        $sale = CatalogSale::factory()->selected()->create(['name' => 'Outerwear 50']);
        $sale->products()->attach([$jacket->id, $dress->id]);

        $this->actingAs($admin)
            ->get(route('admin.sales.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/sales/index')
                ->where('sales.0.applies_to', 'selected')
                ->where(
                    'sales.0.products',
                    fn ($products): bool => collect($products)->pluck('name')->sort()->values()->all() === [
                        'Cotton Safari Jacket',
                        'Silk Wrap Dress',
                    ],
                ));
    }

    public function test_activating_a_sale_turns_off_the_previous_one(): void
    {
        $admin = User::factory()->admin()->create();
        $winter = CatalogSale::factory()->create(['name' => 'Winter Sale', 'percent' => 70]);

        $this->actingAs($admin)
            ->post(route('admin.sales.store'), [
                'name' => 'Summer Sale',
                'percent' => 30,
                'applies_to' => 'all',
                'is_active' => true,
            ])
            ->assertRedirect(route('admin.sales.index'));

        $this->assertFalse((bool) $winter->fresh()?->is_active);
        $this->assertTrue((bool) CatalogSale::query()->where('name', 'Summer Sale')->first()?->is_active);
    }
}
