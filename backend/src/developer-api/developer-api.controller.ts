import { Controller, Post, Body, UseGuards, Param, Patch } from '@nestjs/common';
import type { CreateOrderInput } from '../core/order/order.core';
import { ApiKeyGuard } from './api-key.guard';
import { ProductCore } from '../core/product/product.core';
import { OrderCore, OrderStatus } from '../core/order/order.core';

/**
 * Developer API: programmatic HTTP access for self-hosted server owners.
 * Protected by x-api-key header. All mutations go through Core services
 * (hooks, events, tenant-scoping are applied automatically).
 */
@UseGuards(ApiKeyGuard)
@Controller('api/v1/external')
export class DeveloperApiController {
    constructor(
        private readonly productCore: ProductCore,
        private readonly orderCore: OrderCore,
    ) { }

    @Post('products')
    createProduct(@Body() data: any) {
        return this.productCore.create(data);
    }

    @Patch('products/:id/stock')
    async updateStock(@Param('id') id: string, @Body('stock') stock: number) {
        await this.productCore.updateStock(id, stock);
        return { success: true };
    }

    @Post('orders')
    injectOrder(@Body() data: CreateOrderInput) {
        return this.orderCore.create(data);
    }

    @Patch('orders/:id/status')
    async updateOrderStatus(@Param('id') id: string, @Body('status') status: string) {
        await this.orderCore.updateStatus(id, status as OrderStatus);
        return { success: true };
    }
}
