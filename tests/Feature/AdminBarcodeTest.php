<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminBarcodeTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_barcodes(): void
    {
        $this->get(route('admin.barcodes.index'))->assertRedirect(route('login'));
    }

    public function test_customers_cannot_open_barcodes(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('admin.barcodes.index'))
            ->assertForbidden();
    }

    public function test_creating_a_variant_without_a_barcode_assigns_one(): void
    {
        $admin = User::factory()->admin()->create();
        [$size, $color] = $this->sizeAndColor();
        $product = Product::factory()->create();

        $this->actingAs($admin)
            ->post(route('admin.products.variants.store', $product), [
                'sku' => 'VEL-AUTO-BAR',
                'price' => 1200,
                'stock' => 4,
                'size_id' => $size->id,
                'color_id' => $color->id,
            ])
            ->assertRedirect();

        $variant = ProductVariant::query()->where('sku', 'VEL-AUTO-BAR')->first();

        $this->assertNotNull($variant);
        $this->assertNotNull($variant->barcode);
        $this->assertMatchesRegularExpression('/^890\d{10}$/', (string) $variant->barcode);
    }

    public function test_staff_can_generate_missing_barcodes(): void
    {
        $admin = User::factory()->admin()->create();
        $missing = ProductVariant::factory()->create(['barcode' => null]);
        $ready = ProductVariant::factory()->create(['barcode' => '890000000099']);

        $this->actingAs($admin)
            ->post(route('admin.barcodes.generate'))
            ->assertRedirect();

        $this->assertNotNull($missing->fresh()?->barcode);
        $this->assertSame('890000000099', $ready->fresh()?->barcode);
    }

    public function test_staff_can_print_selected_barcode_labels(): void
    {
        $admin = User::factory()->admin()->create();
        $variant = ProductVariant::factory()->create(['barcode' => '890000000044']);

        $this->actingAs($admin)
            ->get(route('admin.barcodes.print', ['ids' => (string) $variant->id, 'copies' => 2]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/barcodes/print')
                ->has('labels', 2)
                ->where('labels.0.barcode', '890000000044')
                ->where('labels.0.barcode_svg', fn (mixed $svg): bool => is_string($svg) && str_contains($svg, '<svg')));
    }

    public function test_print_copies_can_go_up_to_five_hundred(): void
    {
        $admin = User::factory()->admin()->create();
        $variant = ProductVariant::factory()->create(['barcode' => '890000000055']);

        $this->actingAs($admin)
            ->get(route('admin.barcodes.print', ['ids' => (string) $variant->id, 'copies' => 500]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/barcodes/print')
                ->has('labels', 500)
                ->where('copies', 500));
    }

    public function test_print_copies_are_capped_at_five_hundred(): void
    {
        $admin = User::factory()->admin()->create();
        $variant = ProductVariant::factory()->create(['barcode' => '890000000066']);

        $this->actingAs($admin)
            ->get(route('admin.barcodes.print', ['ids' => (string) $variant->id, 'copies' => 800]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/barcodes/print')
                ->has('labels', 500)
                ->where('copies', 500));
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
