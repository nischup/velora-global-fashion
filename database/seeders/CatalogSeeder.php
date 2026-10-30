<?php

namespace Database\Seeders;

use App\Enums\ProductStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $women = $this->category('Women', null, 1);
        $men = $this->category('Men', null, 2);
        $kids = $this->category('Kids', null, 3);

        $dresses = $this->category('Dresses', $women, 1);
        $tops = $this->category('Tops', $women, 2);
        $shirts = $this->category('Shirts', $men, 1);
        $outerwear = $this->category('Outerwear', $men, 2);
        $boys = $this->category('Boys', $kids, 1);

        $brands = [
            'Velora' => $this->brand('Velora', 'House collection of considered essentials.'),
            'Atelier Noir' => $this->brand('Atelier Noir', 'Tailored evening and occasion wear.'),
            'Lumen' => $this->brand('Lumen', 'Soft layers in natural fibers.'),
            'Grove' => $this->brand('Grove', 'Easy everyday pieces for kids and adults.'),
        ];

        $size = ProductAttribute::query()->firstOrCreate(
            ['slug' => 'size'],
            ['name' => 'Size'],
        );

        $color = ProductAttribute::query()->firstOrCreate(
            ['slug' => 'color'],
            ['name' => 'Color'],
        );

        $sizes = [];
        foreach (['XS', 'S', 'M', 'L', 'XL'] as $index => $value) {
            $sizes[$value] = ProductAttributeValue::query()->firstOrCreate(
                [
                    'product_attribute_id' => $size->id,
                    'slug' => Str::slug($value),
                ],
                [
                    'value' => $value,
                    'sort_order' => $index,
                ],
            );
        }

        $colors = [];
        foreach ([
            ['Black', '#111111'],
            ['Ivory', '#F4EFE6'],
            ['Navy', '#1B2A4A'],
            ['Olive', '#5C6B4A'],
            ['Wine', '#6B2D3C'],
        ] as $index => [$value, $hex]) {
            $colors[$value] = ProductAttributeValue::query()->firstOrCreate(
                [
                    'product_attribute_id' => $color->id,
                    'slug' => Str::slug($value),
                ],
                [
                    'value' => $value,
                    'hex_color' => $hex,
                    'sort_order' => $index,
                ],
            );
        }

        if (Product::query()->exists()) {
            return;
        }

        $this->product(
            'Silk Wrap Dress',
            $dresses,
            $brands['Atelier Noir'],
            'A fluid wrap dress with a self-tie waist.',
            'Cut from washed silk with a soft drape. Wear to dinner or a late gallery opening.',
            true,
            '#6B2D3C',
            [
                ['M', 'Wine', 18900, 12],
                ['L', 'Wine', 18900, 8],
                ['M', 'Black', 18900, 10],
            ],
        );

        $this->product(
            'Evening Slip Dress',
            $dresses,
            $brands['Atelier Noir'],
            'Bias-cut slip with a scooped neckline.',
            'A lean evening silhouette in satin. Layer with the wool coat or wear alone.',
            true,
            '#111111',
            [
                ['S', 'Black', 16500, 6],
                ['M', 'Black', 16500, 9],
                ['S', 'Ivory', 16500, 4],
            ],
        );

        $this->product(
            'Poplin Shirt',
            $tops,
            $brands['Velora'],
            'Crisp cotton shirt with a relaxed collar.',
            'Everyday poplin with a slightly oversized fit. Tucks cleanly into trousers.',
            true,
            '#F4EFE6',
            [
                ['S', 'Ivory', 7200, 18],
                ['M', 'Ivory', 7200, 22],
                ['M', 'Black', 7200, 14],
                ['L', 'Black', 7200, 11],
            ],
        );

        $this->product(
            'Merino Knit Tank',
            $tops,
            $brands['Lumen'],
            'Fine-gauge tank for layering.',
            'Light merino that holds its shape. Wear under the blazer or on its own.',
            false,
            '#5C6B4A',
            [
                ['S', 'Olive', 5400, 7],
                ['M', 'Olive', 5400, 9],
                ['M', 'Navy', 5400, 5],
            ],
        );

        $this->product(
            'Tailored Linen Shirt',
            $shirts,
            $brands['Velora'],
            'Warm-weather shirt with a clean placket.',
            'Garment-washed linen. The collar sits softly without starch.',
            true,
            '#1B2A4A',
            [
                ['M', 'Navy', 8900, 16],
                ['L', 'Navy', 8900, 12],
                ['L', 'Ivory', 8900, 8],
                ['XL', 'Ivory', 8900, 6],
            ],
        );

        $this->product(
            'Structured Blazer',
            $outerwear,
            $brands['Atelier Noir'],
            'Single-breasted blazer with a slight shoulder.',
            'A year-round jacket in a dry wool blend. Pair with denim or the slip dress.',
            true,
            '#111111',
            [
                ['M', 'Black', 24500, 7],
                ['L', 'Black', 24500, 5],
                ['M', 'Navy', 24500, 4],
            ],
        );

        $this->product(
            'Oversized Wool Coat',
            $outerwear,
            $brands['Lumen'],
            'Long coat with dropped shoulders.',
            'Double-faced wool with hidden buttons. Cut generously over knitwear.',
            false,
            '#5C6B4A',
            [
                ['M', 'Olive', 32000, 3],
                ['L', 'Olive', 32000, 2],
                ['L', 'Black', 32000, 4],
            ],
        );

        $this->product(
            'Cotton Kids Tee',
            $boys,
            $brands['Grove'],
            'Soft jersey tee built for play.',
            'Organic cotton with a reinforced neck. Washes well and keeps its shape.',
            true,
            '#1B2A4A',
            [
                ['S', 'Navy', 2800, 20],
                ['M', 'Navy', 2800, 18],
                ['M', 'Olive', 2800, 15],
                ['L', 'Ivory', 2800, 12],
            ],
        );
    }

    private function category(string $name, ?Category $parent, int $sort): Category
    {
        return Category::query()->firstOrCreate(
            ['slug' => Str::slug($name)],
            [
                'name' => $name,
                'parent_id' => $parent?->id,
                'is_active' => true,
                'sort_order' => $sort,
            ],
        );
    }

    private function brand(string $name, string $description): Brand
    {
        return Brand::query()->firstOrCreate(
            ['slug' => Str::slug($name)],
            [
                'name' => $name,
                'description' => $description,
                'is_active' => true,
            ],
        );
    }

    /**
     * @param  list<array{0: string, 1: string, 2: int, 3: int}>  $variants
     */
    private function product(
        string $name,
        Category $category,
        Brand $brand,
        string $short,
        string $description,
        bool $featured,
        string $hex,
        array $variants,
    ): void {
        $product = Product::query()->create([
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'name' => $name,
            'slug' => Str::slug($name),
            'short_description' => $short,
            'description' => $description,
            'status' => ProductStatus::Live,
            'is_featured' => $featured,
        ]);

        $path = $this->storePlaceholder($product->slug, $hex);

        $product->images()->create([
            'path' => $path,
            'alt' => $name,
            'sort_order' => 0,
            'is_primary' => true,
        ]);

        foreach ($variants as $index => [$size, $color, $price, $stock]) {
            $sizeValue = ProductAttributeValue::query()->where('slug', Str::slug($size))->first();
            $colorValue = ProductAttributeValue::query()->where('slug', Str::slug($color))->first();

            if (! $sizeValue || ! $colorValue) {
                continue;
            }

            $variant = $product->variants()->create([
                'sku' => strtoupper('VEL-'.$product->id.'-'.$size.'-'.Str::slug($color).'-'.$index),
                'barcode' => '890'.str_pad((string) (($product->id * 100) + $index), 10, '0', STR_PAD_LEFT),
                'price' => $price,
                'compare_at_price' => $index === 0 ? $price + 1500 : null,
                'stock' => $stock,
                'low_stock_threshold' => 5,
                'is_active' => true,
            ]);

            $variant->attributeValues()->sync([$sizeValue->id, $colorValue->id]);
        }
    }

    private function storePlaceholder(string $filename, string $hex): string
    {
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{$hex}"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#fade)"/>
</svg>
SVG;

        $path = "products/{$filename}.svg";
        Storage::disk('public')->put($path, $svg);

        return $path;
    }
}
