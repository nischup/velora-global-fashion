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
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 20)->unique();
            $table->string('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('pos_registers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code', 20);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['store_id', 'code']);
        });

        Schema::create('pos_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pos_register_id')->constrained()->restrictOnDelete();
            $table->foreignId('cashier_id')->constrained('users')->restrictOnDelete();
            $table->string('status')->default('open')->index();
            $table->decimal('opening_cash', 10, 2)->default(0);
            $table->decimal('expected_cash', 10, 2)->nullable();
            $table->decimal('counted_cash', 10, 2)->nullable();
            $table->decimal('difference', 10, 2)->nullable();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('order_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_return_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pos_shift_id')->nullable()->constrained()->nullOnDelete();
            $table->string('method');
            $table->string('type')->default('sale');
            $table->decimal('amount', 10, 2);
            $table->decimal('amount_tendered', 10, 2)->nullable();
            $table->decimal('change_due', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pos_register_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pos_shift_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
        });

        Schema::table('pos_holds', function (Blueprint $table) {
            $table->foreignId('pos_register_id')->nullable()->constrained()->nullOnDelete();
        });

        $now = now();
        $storeId = DB::table('stores')->insertGetId([
            'name' => 'Velora Flagship',
            'code' => 'FLG',
            'address' => 'Dhaka',
            'phone' => null,
            'tax_rate' => 0,
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('pos_registers')->insert([
            'store_id' => $storeId,
            'name' => 'Counter 1',
            'code' => 'FLG-1',
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_holds', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pos_register_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pos_shift_id');
            $table->dropConstrainedForeignId('pos_register_id');
            $table->dropConstrainedForeignId('store_id');
            $table->dropColumn(['tax_rate', 'tax_amount']);
        });

        Schema::dropIfExists('order_payments');
        Schema::dropIfExists('pos_shifts');
        Schema::dropIfExists('pos_registers');
        Schema::dropIfExists('stores');
    }
};
