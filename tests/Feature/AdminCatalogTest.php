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
