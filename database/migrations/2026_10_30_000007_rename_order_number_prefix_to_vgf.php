<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->renamePrefix('VEL-', 'VGF-');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->renamePrefix('VGF-', 'VEL-');
    }

    private function renamePrefix(string $from, string $to): void
    {
        DB::table('orders')
            ->where('number', 'like', $from.'%')
            ->orderBy('id')
            ->lazyById()
            ->each(function (object $order) use ($from, $to): void {
                $number = preg_replace(
                    '/^'.preg_quote($from, '/').'(\d{6}-[A-Z0-9]{4})$/',
                    $to.'$1',
                    (string) $order->number,
                );

                if (! is_string($number) || $number === $order->number) {
                    return;
                }

                $notes = is_string($order->notes)
                    ? preg_replace(
                        '/'.preg_quote($from, '/').'(\d{6}-[A-Z0-9]{4})/',
                        $to.'$1',
                        $order->notes,
                    )
                    : $order->notes;

                DB::table('orders')->where('id', $order->id)->update([
                    'number' => $number,
                    'notes' => $notes,
                ]);
            });
    }
};
