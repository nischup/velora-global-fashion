<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
            $table->string('source')->default('online')->index();
            $table->foreignId('cashier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->string('payment_method')->nullable();
            $table->decimal('amount_tendered', 10, 2)->nullable();
            $table->decimal('change_due', 10, 2)->nullable();
            $table->decimal('refunded_amount', 10, 2)->default(0);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->unsignedInteger('returned_quantity')->default(0);
        });

        Schema::create('order_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cashier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('refund_method');
            $table->decimal('refund_amount', 10, 2);
            $table->string('reason')->nullable();
            $table->timestamps();
        });

        Schema::create('order_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_return_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('line_total', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_return_items');
        Schema::dropIfExists('order_returns');

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('returned_quantity');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['cashier_id']);
            $table->dropColumn([
                'source',
                'cashier_id',
                'discount_amount',
                'payment_method',
                'amount_tendered',
                'change_due',
                'refunded_amount',
            ]);
            $table->dropForeign(['user_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
        });
    }
};
