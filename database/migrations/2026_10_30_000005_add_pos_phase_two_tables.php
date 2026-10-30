<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->string('barcode')->nullable()->unique();
        });

        Schema::create('store_customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 30)->unique();
            $table->string('email')->nullable();
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('store_customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('exchanged_from_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->decimal('exchange_credit', 10, 2)->default(0);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('discount_amount', 10, 2)->default(0);
        });

        Schema::create('pos_holds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cashier_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('store_customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name')->nullable();
            $table->string('customer_phone', 30)->nullable();
            $table->string('discount_type')->default('none');
            $table->decimal('discount_value', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('pos_hold_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pos_hold_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity');
            $table->string('discount_type')->default('none');
            $table->decimal('discount_value', 10, 2)->default(0);
            $table->timestamps();
        });

        $variantIds = DB::table('product_variants')->whereNull('barcode')->pluck('id');

        foreach ($variantIds as $variantId) {
            DB::table('product_variants')
                ->where('id', $variantId)
                ->update([
                    'barcode' => '890'.str_pad((string) $variantId, 10, '0', STR_PAD_LEFT),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_hold_items');
        Schema::dropIfExists('pos_holds');

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('discount_amount');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('exchanged_from_order_id');
            $table->dropConstrainedForeignId('store_customer_id');
            $table->dropColumn('exchange_credit');
        });

        Schema::dropIfExists('store_customers');

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropUnique(['barcode']);
            $table->dropColumn('barcode');
        });
    }
};
