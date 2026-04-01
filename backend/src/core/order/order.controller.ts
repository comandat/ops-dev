import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { OrderCore, OrderStatus } from './order.core';
import type { CreateOrderInput, OrderFilters } from './order.core';

@Controller('api/orders')
export class OrderController {
    constructor(private readonly orderCore: OrderCore) { }

    @Post()
    create(@Body() body: CreateOrderInput) {
        return this.orderCore.create(body);
    }

    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('source') sourcePlugin?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortDir') sortDir?: 'asc' | 'desc',
    ) {
        const filters: OrderFilters = {
            search,
            status: status as OrderStatus | undefined,
            sourcePlugin,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            sortBy,
            sortDir,
        };
        return this.orderCore.findAll(filters);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.orderCore.findById(id);
    }

    @Put('batch/status')
    updateBatchStatus(@Body() body: { ids: string[]; status: string }) {
        return this.orderCore.updateStatusBatch(body.ids, body.status as OrderStatus);
    }

    @Put(':id/notes')
    updateNotes(@Param('id') id: string, @Body() body: { notes: string }) {
        return this.orderCore.updateNotes(id, body.notes);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() body: { status?: string; note?: string;[key: string]: unknown },
    ) {
        if (body.status) {
            return this.orderCore.updateStatus(id, body.status as OrderStatus, body.note);
        }
        return this.orderCore.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.orderCore.remove(id);
    }
}
