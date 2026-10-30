<?php

namespace Tests\Unit;

use App\Support\Code128;
use PHPUnit\Framework\TestCase;

class Code128Test extends TestCase
{
    public function test_it_renders_an_svg_barcode(): void
    {
        $svg = Code128::svg('890000000012');

        $this->assertStringContainsString('<svg', $svg);
        $this->assertStringContainsString('<rect', $svg);
        $this->assertStringContainsString('890000000012', $svg);
    }
}
