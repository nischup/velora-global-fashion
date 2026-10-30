<?php

namespace Tests\Feature;

use App\Enums\ProductStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_admin_catalog(): void
    {
        $this->get(route('admin.products.index'))->assertRedirect(route('login'));
    }

    public function test_customers_cannot_access_admin_catalog(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)
            ->get(route('admin.products.index'))
            ->assertForbidden();
    }

    public function test_admin_can_create_a_category(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.categories.store'), [
                'name' => 'Women',
                'is_active' => true,
            ])
            ->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('categories', [
            'name' => 'Women',
            'slug' => 'women',
        ]);
    }

    public function test_admin_can_create_a_product_with_a_variant_and_image(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();
        $brand = Brand::factory()->create();
        [$size, $color] = $this->sizeAndColor();

        $this->actingAs($admin)
            ->post(route('admin.products.store'), [
                'name' => 'Silk Wrap Dress',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'short_description' => 'A fluid wrap dress.',
                'status' => ProductStatus::Live->value,
                'is_featured' => true,
                'images' => [UploadedFile::fake()->image('dress.jpg')],
                'variants' => [
                    [
                        'sku' => 'VEL-DRESS-M-BLK',
                        'price' => 189,
                        'stock' => 8,
                        'low_stock_threshold' => 3,
                        'is_active' => true,
                        'size_id' => $size->id,
                        'color_id' => $color->id,
                    ],
                ],
            ])
            ->assertRedirect();

        $product = Product::query()->where('name', 'Silk Wrap Dress')->first();

        $this->assertNotNull($product);
        $this->assertDatabaseHas('product_variants', [
            'product_id' => $product->id,
            'sku' => 'VEL-DRESS-M-BLK',
            'stock' => 8,
        ]);
        $this->assertDatabaseCount('product_images', 1);
    }

    public function test_admin_can_create_a_product_without_sku_or_barcode(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();
        [$size, $color] = $this->sizeAndColor();

        $this->actingAs($admin)
            ->post(route('admin.products.store'), [
                'name' => 'Poplin Camp Shirt',
                'category_id' => $category->id,
                'status' => ProductStatus::Live->value,
                'variants' => [
                    [
                        'sku' => '',
                        'barcode' => '',
                        'price' => 7200,
                        'stock' => 6,
                        'size_id' => $size->id,
                        'color_id' => $color->id,
                    ],
                ],
            ])
            ->assertRedirect();

        $product = Product::query()->where('name', 'Poplin Camp Shirt')->first();

        $this->assertNotNull($product);
        $this->assertDatabaseCount('product_variants', 1);
        $this->assertNotNull($product->variants()->first()?->sku);
        $this->assertNotNull($product->variants()->first()?->barcode);
    }

    public function test_admin_can_filter_products_by_low_stock(): void
    {
        $admin = User::factory()->admin()->create();
        $low = Product::factory()->create(['name' => 'Low Stock Coat']);
        ProductVariant::factory()->create([
            'product_id' => $low->id,
            'stock' => 1,
            'low_stock_threshold' => 5,
        ]);
        $healthy = Product::factory()->create(['name' => 'Healthy Stock Shirt']);
        ProductVariant::factory()->create([
            'product_id' => $healthy->id,
            'stock' => 20,
            'low_stock_threshold' => 5,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.products.index', ['stock' => 'low']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/products/index')
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Low Stock Coat')
                ->where('filters.stock', 'low'));
    }

    public function test_admin_can_filter_products_by_live_status(): void
    {
        $admin = User::factory()->admin()->create();
        Product::factory()->create(['name' => 'Live Dress', 'status' => ProductStatus::Live]);
        Product::factory()->draft()->create(['name' => 'Draft Coat']);

        $this->actingAs($admin)
            ->get(route('admin.products.index', ['status' => 'live']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/products/index')
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Live Dress')
                ->where('filters.status', 'live'));
    }

    public function test_admin_can_update_variant_stock(): void
    {
        $admin = User::factory()->admin()->create();
        $product = Product::factory()->create();
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'stock' => 4,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.products.variants.stock', [$product, $variant]), [
                'stock' => 18,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('product_variants', [
            'id' => $variant->id,
            'stock' => 18,
        ]);
    }

    /**
     * @return array{0: ProductAttributeValue, 1: ProductAttributeValue}
     */
    private function sizeAndColor(): array
    {
        $size = ProductAttribute::factory()->create(['name' => 'Size', 'slug' => 'size']);
        $color = ProductAttribute::factory()->create(['name' => 'Color', 'slug' => 'color']);

        return [
            ProductAttributeValue::factory()->create([
                'product_attribute_id' => $size->id,
                'value' => 'M',
                'slug' => 'm',
            ]),
            ProductAttributeValue::factory()->create([
                'product_attribute_id' => $color->id,
                'value' => 'Black',
                'slug' => 'black',
            ]),
        ];
    }
}
