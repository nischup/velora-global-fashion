<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog_sales', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->unsignedTinyInteger('percent');
            $table->string('applies_to')->default('all');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        Schema::create('catalog_sale_product', function (Blueprint $table): void {
            $table->foreignId('catalog_sale_id')->constrained('catalog_sales')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->primary(['catalog_sale_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_sale_product');
        Schema::dropIfExists('catalog_sales');
    }
};
