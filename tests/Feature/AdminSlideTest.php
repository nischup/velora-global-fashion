<?php

namespace Tests\Feature;

use App\Models\HeroSlide;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminSlideTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_slides_appear_on_the_homepage_instead_of_featured_products(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $product = Product::factory()->featured()->create([
            'name' => 'Silk Wrap Dress',
        ]);
        ProductVariant::factory()->create(['product_id' => $product->id]);

        $this->actingAs($admin)
            ->post(route('admin.slides.store'), [
                'title' => 'Evening edit',
                'description' => 'Silk for the season.',
                'eyebrow' => 'New arrival',
                'product_id' => $product->id,
                'sort_order' => 1,
                'is_active' => true,
                'image' => UploadedFile::fake()->image('banner.jpg'),
            ])
            ->assertRedirect(route('admin.slides.index'));

        $slide = HeroSlide::query()->firstOrFail();
        Storage::disk('public')->assertExists($slide->image);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('shop/home')
                ->has('slides', 1)
                ->where('slides.0.title', 'Evening edit')
                ->where('slides.0.brand', 'New arrival')
                ->where('slides.0.slug', $product->slug)
            );
    }

    public function test_hidden_slides_fall_back_to_featured_products(): void
    {
        $product = Product::factory()->featured()->create([
            'name' => 'Silk Wrap Dress',
        ]);
        ProductVariant::factory()->create(['product_id' => $product->id]);

        HeroSlide::query()->create([
            'title' => 'Hidden banner',
            'is_active' => false,
            'sort_order' => 0,
        ]);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('slides.0.title', 'Silk Wrap Dress')
            );
    }
}
