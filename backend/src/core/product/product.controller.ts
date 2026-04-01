import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException, UseGuards } from '@nestjs/common';
import { ProductCore } from './product.core';
import type { ProductFilters } from './product.core';
import { CreateProductInput, UpdateProductInput } from './product.core';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/products')
export class ProductController {
    constructor(private readonly productCore: ProductCore) { }

    @Post()
    create(@Body() body: CreateProductInput) {
        return this.productCore.create(body);
    }

    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('stockFilter') stockFilter?: 'all' | 'out_of_stock' | 'low_stock',
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortDir') sortDir?: 'asc' | 'desc',
    ) {
        const filters: ProductFilters = {
            search,
            stockFilter,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            sortBy,
            sortDir,
        };
        console.log(`[ProductController] findAll called with: ${JSON.stringify(filters)}`);
        return this.productCore.findAll(filters);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const product = await this.productCore.findById(id);
        if (!product) throw new NotFoundException('Product not found or access denied');
        return product;
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: UpdateProductInput) {
        const result = await this.productCore.update(id, body);
        if (result.count === 0) throw new NotFoundException('Product not found or access denied');
        return result;
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const result = await this.productCore.remove(id);
        if (result.count === 0) throw new NotFoundException('Product not found or access denied');
        return { success: true };
    }
}
