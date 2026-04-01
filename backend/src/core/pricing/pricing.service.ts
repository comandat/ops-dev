import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContextService } from '../../tenant/tenant-context.service';

// ─── Domain Types ────────────────────────────────────────────────────────────

export type PricingRuleType = 'PERCENTAGE_ABOVE' | 'FIXED_ABOVE' | 'FIXED_PRICE';

export interface CreatePricingRuleInput {
    pluginName: string;
    type: PricingRuleType;
    value: number;
    label?: string;
}

export type UpdatePricingRuleInput = Partial<CreatePricingRuleInput>;

const WILDCARD_PLUGIN = '*';

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class PricingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
    ) { }

    private get tenantId(): string {
        return this.tenantContext.getTenantId();
    }

    /**
     * Returns the effective listing price for a given base price on a marketplace.
     * Priority: exact plugin rule → wildcard rule → base price unchanged.
     */
    async computeListingPrice(basePrice: number, pluginName: string): Promise<number> {
        const applicableRules = await this.prisma.pricingRule.findMany({
            where: {
                tenantId: this.tenantId,
                pluginName: { in: [pluginName, WILDCARD_PLUGIN] },
            },
            orderBy: { createdAt: 'asc' },
        });

        if (!applicableRules.length) return basePrice;

        const rule =
            applicableRules.find(r => r.pluginName === pluginName) ??
            applicableRules[0];

        return this.applyRuleToPrice(basePrice, rule.type as PricingRuleType, rule.value);
    }

    async findAll(pluginName?: string) {
        return this.prisma.pricingRule.findMany({
            where: {
                tenantId: this.tenantId,
                ...(pluginName ? { pluginName } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(input: CreatePricingRuleInput) {
        if (input.value < 0) {
            throw new BadRequestException('Pricing rule value must be a positive number');
        }
        return this.prisma.pricingRule.create({
            data: { ...input, tenantId: this.tenantId },
        });
    }

    async update(id: string, patch: UpdatePricingRuleInput) {
        await this.assertRuleExists(id);
        return this.prisma.pricingRule.updateMany({
            where: { id, tenantId: this.tenantId },
            data: patch as Prisma.PricingRuleUpdateManyMutationInput,
        });
    }

    async remove(id: string) {
        await this.assertRuleExists(id);
        return this.prisma.pricingRule.deleteMany({
            where: { id, tenantId: this.tenantId },
        });
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private applyRuleToPrice(basePrice: number, type: PricingRuleType, value: number): number {
        switch (type) {
            case 'FIXED_PRICE': return value;
            case 'FIXED_ABOVE': return basePrice + value;
            case 'PERCENTAGE_ABOVE': return basePrice * (1 + value / 100);
        }
    }

    private async assertRuleExists(id: string): Promise<void> {
        const exists = await this.prisma.pricingRule.findFirst({
            where: { id, tenantId: this.tenantId },
            select: { id: true },
        });
        if (!exists) {
            throw new NotFoundException(`Pricing rule '${id}' not found`);
        }
    }
}
