import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContextService } from '../../tenant/tenant-context.service';
import { OfferCore } from './offer.core';

// ─── Domain Types ────────────────────────────────────────────────────────────

export interface CreateOfferTemplateInput {
    name: string;
    pluginName: string;
    titleTemplate?: string;
    descriptionTemplate?: string;
    externalCategory?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class OfferTemplateService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
        private readonly offerCore: OfferCore,
    ) { }

    private get tenantId(): string {
        return this.tenantContext.getTenantId();
    }

    async findAll(pluginName?: string) {
        return this.prisma.offerTemplate.findMany({
            where: {
                tenantId: this.tenantId,
                ...(pluginName ? { pluginName } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(input: CreateOfferTemplateInput) {
        return this.prisma.offerTemplate.create({
            data: { ...input, tenantId: this.tenantId },
        });
    }

    async remove(id: string) {
        await this.assertTemplateExists(id);
        return this.prisma.offerTemplate.deleteMany({
            where: { id, tenantId: this.tenantId },
        });
    }

    /**
     * Instantiates a ProductOffer from a template.
     * Substitutes {name} and {sku} tokens in the title/description fields.
     */
    async applyToProduct(templateId: string, productId: string) {
        const [template, product] = await Promise.all([
            this.prisma.offerTemplate.findFirst({
                where: { id: templateId, tenantId: this.tenantId },
            }),
            this.prisma.product.findFirst({
                where: { id: productId, tenantId: this.tenantId },
            }),
        ]);

        if (!template) throw new NotFoundException(`Offer template '${templateId}' not found`);
        if (!product) throw new NotFoundException(`Product '${productId}' not found`);

        const interpolate = (template: string | null): string | undefined => {
            if (!template) return undefined;
            return template
                .replace(/\{name\}/g, product.name)
                .replace(/\{sku\}/g, product.sku);
        };

        return this.offerCore.create(productId, template.pluginName, {
            title: interpolate(template.titleTemplate),
            description: interpolate(template.descriptionTemplate),
            externalCategory: template.externalCategory ?? undefined,
        });
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private async assertTemplateExists(id: string): Promise<void> {
        const exists = await this.prisma.offerTemplate.findFirst({
            where: { id, tenantId: this.tenantId },
            select: { id: true },
        });
        if (!exists) {
            throw new NotFoundException(`Offer template '${id}' not found`);
        }
    }
}
