import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EventBusService } from '../../event-bus/event-bus.service';
import { HookService } from '../../plugin-engine/hooks/hook.service';
import { TenantContextService } from '../../tenant/tenant-context.service';
import { ActivityService } from '../activity/activity.service';

import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductInput {
    @IsString()
    sku: string;

    @IsString()
    name: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    stock?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    images?: string;
}

export class UpdateProductInput {
    @IsOptional()
    @IsString()
    sku?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    stock?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    images?: string;
}

export interface ProductFilters {
    search?: string;
    minStock?: number;
    maxStock?: number;
    stockFilter?: 'all' | 'out_of_stock' | 'low_stock';
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;
const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_SORT_DIR = 'desc';

@Injectable()
export class ProductCore {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventBus: EventBusService,
        private readonly hooks: HookService,
        private readonly tenantContext: TenantContextService,
        private readonly activity: ActivityService,
    ) { }

    private get tenantId(): string {
        return this.tenantContext.getTenantId();
    }

    async create(data: CreateProductInput) {
        const processed = await this.hooks.run('product.beforeCreate', data) as CreateProductInput;

        const product = await this.prisma.product.create({
            data: {
                tenantId: this.tenantId,
                sku: processed.sku,
                name: processed.name,
                price: processed.price,
                stock: processed.stock ?? 0,
                description: processed.description,
                images: processed.images,
            },
        });

        await this.activity.log('system', 'product.created', JSON.stringify({ productId: product.id, sku: product.sku }), 'success');
        await this.eventBus.emit('product.created', product);
        await this.hooks.run('product.afterCreate', product);
        return product;
    }

    async findAll(filters: ProductFilters = {}) {
        const page = filters.page ?? DEFAULT_PAGE;
        const limit = filters.limit ?? DEFAULT_LIMIT;
        const skip = (page - 1) * limit;

        const where = this.buildWhereClause(filters);
        const orderBy = this.buildOrderByClause(filters);

        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    offers: {
                        select: { pluginName: true, status: true, isActive: true, isLinked: true, externalId: true },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.product.count({ where }),
        ]);

        return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    }

    async findById(id: string) {
        return this.prisma.product.findFirst({
            where: { id, tenantId: this.tenantId },
            include: { offers: true },
        });
    }

    async findBySku(sku: string) {
        return this.prisma.product.findFirst({
            where: { sku, tenantId: this.tenantId },
        });
    }

    async update(id: string, data: UpdateProductInput) {
        const processed = await this.hooks.run('product.beforeUpdate', { id, ...data });

        const result = await this.prisma.product.updateMany({
            where: { id, tenantId: this.tenantId },
            data: processed as Prisma.ProductUpdateInput,
        });

        await this.eventBus.emit('product.updated', { productId: id, changes: data, propagate: true });
        await this.activity.log('system', 'product.updated', JSON.stringify({ productId: id }));
        await this.hooks.run('product.afterUpdate', { id, ...data });
        return result;
    }

    async updateStock(id: string, newStock: number) {
        await this.hooks.run('inventory.beforeUpdate', { productId: id, newStock });

        await this.prisma.product.updateMany({
            where: { id, tenantId: this.tenantId },
            data: { stock: newStock },
        });

        const product = await this.findById(id);
        if (product && newStock <= product.lowStockThreshold) {
            await this.eventBus.emit('stock.critical', {
                productId: id,
                productName: product.name,
                sku: product.sku,
                stock: newStock,
                threshold: product.lowStockThreshold,
            });
            await this.activity.log('system', 'stock.critical', JSON.stringify({ productId: id, stock: newStock }), 'warn');
        }

        await this.eventBus.emit('inventory.updated', { productId: id, newStock });
        await this.hooks.run('inventory.afterUpdate', { productId: id, newStock });
    }

    async remove(id: string) {
        return this.prisma.product.deleteMany({
            where: { id, tenantId: this.tenantId },
        });
    }

    async countLowStock(): Promise<number> {
        return this.prisma.product.count({
            where: { tenantId: this.tenantId, stock: { lte: 10 } },
        });
    }

    async countAll(): Promise<number> {
        return this.prisma.product.count({
            where: { tenantId: this.tenantId },
        });
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private buildWhereClause(filters: ProductFilters): Prisma.ProductWhereInput {
        const where: Prisma.ProductWhereInput = { tenantId: this.tenantId };

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { sku: { contains: filters.search } },
                { description: { contains: filters.search } },
            ];
        }

        if (filters.stockFilter === 'out_of_stock') {
            where.stock = { equals: 0 };
        } else if (filters.stockFilter === 'low_stock') {
            where.stock = { gt: 0, lte: filters.maxStock ?? 10 };
        } else {
            const stockRange: Prisma.IntFilter = {};
            if (filters.minStock !== undefined) stockRange.gte = filters.minStock;
            if (filters.maxStock !== undefined) stockRange.lte = filters.maxStock;
            if (Object.keys(stockRange).length > 0) {
                where.stock = stockRange;
            }
        }

        return where;
    }

    private buildOrderByClause(filters: ProductFilters): Prisma.ProductOrderByWithRelationInput {
        const field = filters.sortBy ?? DEFAULT_SORT_BY;
        const direction = filters.sortDir ?? DEFAULT_SORT_DIR;
        return { [field]: direction };
    }
}
