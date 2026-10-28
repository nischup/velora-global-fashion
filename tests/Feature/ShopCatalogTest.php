<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShopCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_view_the_home_and_shop_pages(): void
    {
        $this->get(route('home'))->assertOk();
        $this->get(route('shop.index'))->assertOk();
    }

    public function test_home_page_includes_new_season_slides(): void
    {
        $product = Product::factory()->featured()->create([
            'name' => 'Silk Wrap Dress',
        ]);
        ProductVariant::factory()->create(['product_id' => $product->id]);

        $this->get(route('home'))
            ->assertOk()
            ->assertSee('New season')
            ->assertSee('Silk Wrap Dress');
    }

    public function test_live_products_appear_on_the_shop_and_drafts_do_not(): void
    {
        $live = Product::factory()->create(['name' => 'Live Silk Dress']);
        ProductVariant::factory()->create(['product_id' => $live->id, 'price' => 100]);

        $draft = Product::factory()->draft()->create(['name' => 'Hidden Draft Coat']);
        ProductVariant::factory()->create(['product_id' => $draft->id, 'price' => 200]);

        $this->get(route('shop.index'))
            ->assertOk()
            ->assertSee('Live Silk Dress')
            ->assertDontSee('Hidden Draft Coat');
    }

    public function test_shop_search_filters_products_by_name(): void
    {
        $match = Product::factory()->create(['name' => 'Linen Summer Shirt']);
        ProductVariant::factory()->create(['product_id' => $match->id]);

        $other = Product::factory()->create(['name' => 'Wool Winter Coat']);
        ProductVariant::factory()->create(['product_id' => $other->id]);

        $this->get(route('shop.index', ['q' => 'Linen']))
            ->assertOk()
            ->assertSee('Linen Summer Shirt')
            ->assertDontSee('Wool Winter Coat');
    }

    public function test_category_page_lists_products_in_that_category(): void
    {
        $dresses = Category::factory()->create(['name' => 'Dresses', 'slug' => 'dresses']);
        $shirts = Category::factory()->create(['name' => 'Shirts', 'slug' => 'shirts']);

        $dress = Product::factory()->create(['name' => 'Wrap Dress', 'category_id' => $dresses->id]);
        ProductVariant::factory()->create(['product_id' => $dress->id]);

        $shirt = Product::factory()->create(['name' => 'Oxford Shirt', 'category_id' => $shirts->id]);
        ProductVariant::factory()->create(['product_id' => $shirt->id]);

        $this->get(route('shop.category', $dresses))
            ->assertOk()
            ->assertSee('Wrap Dress')
            ->assertDontSee('Oxford Shirt');
    }

    public function test_product_page_is_available_for_live_products_only(): void
    {
        $live = Product::factory()->create(['name' => 'Navy Blazer']);
        ProductVariant::factory()->create(['product_id' => $live->id, 'sku' => 'VEL-BLAZER-M']);

        $draft = Product::factory()->draft()->create();

        $this->get(route('products.show', $live))
            ->assertOk()
            ->assertSee('Navy Blazer')
            ->assertSee('VEL-BLAZER-M');

        $this->get(route('products.show', $draft))->assertNotFound();
    }
}
