<?php

use App\Http\Controllers\Account\AccountController;
use App\Http\Controllers\Account\OrderController as AccountOrderController;
use App\Http\Controllers\Admin\AttributeController;
use App\Http\Controllers\Admin\BarcodeController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CatalogSaleController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\OrderReturnController;
use App\Http\Controllers\Admin\PosController;
use App\Http\Controllers\Admin\PosRegisterController;
use App\Http\Controllers\Admin\PosReportController;
use App\Http\Controllers\Admin\PosShiftController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductImageController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\ReturnController;
use App\Http\Controllers\Admin\SlideController;
use App\Http\Controllers\Admin\StoreController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\CatalogController;
use App\Http\Controllers\Shop\CheckoutController;
use App\Http\Controllers\Shop\HomeController;
use App\Http\Controllers\Shop\ProductController as ShopProductController;
use App\Http\Controllers\Shop\WishlistController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/shop', [CatalogController::class, 'index'])->name('shop.index');
Route::get('/shop/{category:slug}', [CatalogController::class, 'category'])->name('shop.category');
Route::get('/products/{product:slug}', [ShopProductController::class, 'show'])->name('products.show');

Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
Route::patch('/cart/{variant}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{variant}', [CartController::class, 'destroy'])->name('cart.destroy');

Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
Route::post('/wishlist', [WishlistController::class, 'store'])->name('wishlist.store');
Route::delete('/wishlist/{product}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout.create');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    Route::prefix('account')->name('account.')->group(function () {
        Route::get('/', [AccountController::class, 'index'])->name('index');
        Route::get('/orders', [AccountOrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [AccountOrderController::class, 'show'])->name('orders.show');
    });
});

Route::middleware(['auth', 'verified', 'staff'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('pos', [PosController::class, 'index'])->name('pos.index');
    Route::get('pos/lookup', [PosController::class, 'lookup'])->name('pos.lookup');
    Route::get('pos/customers', [PosController::class, 'customers'])->name('pos.customers');
    Route::get('pos/reports', [PosReportController::class, 'index'])->name('pos.reports.index');
    Route::post('pos/shifts', [PosShiftController::class, 'store'])->name('pos.shifts.store');
    Route::patch('pos/shifts/{shift}', [PosShiftController::class, 'update'])->name('pos.shifts.update');
    Route::post('pos', [PosController::class, 'store'])->name('pos.store');
    Route::post('pos/holds', [PosController::class, 'hold'])->name('pos.holds.store');
    Route::delete('pos/holds/{hold}', [PosController::class, 'discardHold'])->name('pos.holds.destroy');
    Route::post('pos/{order}/exchange', [PosController::class, 'exchange'])->name('pos.exchange');
    Route::get('pos/{order}/receipt', [PosController::class, 'receipt'])->name('pos.receipt');

    Route::resource('stores', StoreController::class)->except(['show']);
    Route::post('stores/{store}/registers', [PosRegisterController::class, 'store'])->name('stores.registers.store');
    Route::put('registers/{register}', [PosRegisterController::class, 'update'])->name('registers.update');
    Route::delete('registers/{register}', [PosRegisterController::class, 'destroy'])->name('registers.destroy');

    Route::get('returns', [ReturnController::class, 'index'])->name('returns.index');
    Route::get('returns/{order}', [ReturnController::class, 'show'])->name('returns.show');

    Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::post('orders/bulk', [AdminOrderController::class, 'bulk'])->name('orders.bulk');
    Route::get('orders/{order}/invoice', [AdminOrderController::class, 'invoice'])->name('orders.invoice');
    Route::get('orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::patch('orders/{order}', [AdminOrderController::class, 'update'])->name('orders.update');
    Route::post('orders/{order}/returns', [OrderReturnController::class, 'store'])->name('orders.returns.store');

    Route::resource('slides', SlideController::class)->except(['show']);
    Route::resource('categories', CategoryController::class)->except(['show']);
    Route::resource('brands', BrandController::class)->except(['show']);
    Route::resource('sales', CatalogSaleController::class)->except(['show']);
    Route::resource('attributes', AttributeController::class)->except(['show']);
    Route::get('barcodes', [BarcodeController::class, 'index'])->name('barcodes.index');
    Route::post('barcodes/generate', [BarcodeController::class, 'generate'])->name('barcodes.generate');
    Route::get('barcodes/print', [BarcodeController::class, 'print'])->name('barcodes.print');

    Route::resource('products', ProductController::class)->except(['show']);

    Route::post('products/{product}/images', [ProductImageController::class, 'store'])->name('products.images.store');
    Route::delete('products/{product}/images/{image}', [ProductImageController::class, 'destroy'])->name('products.images.destroy');
    Route::patch('products/{product}/images/{image}/primary', [ProductImageController::class, 'primary'])->name('products.images.primary');

    Route::post('products/{product}/variants', [ProductVariantController::class, 'store'])->name('products.variants.store');
    Route::put('products/{product}/variants/{variant}', [ProductVariantController::class, 'update'])->name('products.variants.update');
    Route::patch('products/{product}/variants/{variant}/stock', [ProductVariantController::class, 'updateStock'])->name('products.variants.stock');
    Route::delete('products/{product}/variants/{variant}', [ProductVariantController::class, 'destroy'])->name('products.variants.destroy');
});

require __DIR__.'/settings.php';
