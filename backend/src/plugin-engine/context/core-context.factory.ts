import { Injectable } from '@nestjs/common';
import { ProductCore } from '../../core/product/product.core';
import { OrderCore, OrderStatus, CreateOrderInput } from '../../core/order/order.core';
import { CustomerCore } from '../../core/customer/customer.core';
import { OfferCore } from '../../core/offer/offer.core';
import { PrismaService } from '../../prisma/prisma.service';
import { HookService } from '../hooks/hook.service';
import { CoreContext } from '../interfaces/plugin-base.interface';
import { TenantContextService } from '../../tenant/tenant-context.service';

/**
 * CoreContextFactory — Builds the CoreContext object injected into plugins.
 * Plugins never touch PrismaService directly.
 * All calls are tenant-scoped automatically via TenantContextService.
 */
@Injectable()
export class CoreContextFactory {
    constructor(
        private productCore: ProductCore,
        private orderCore: OrderCore,
        private customerCore: CustomerCore,
        private offerCore: OfferCore,
        private prisma: PrismaService,
        private hooks: HookService,
        private tenantContext: TenantContextService,
    ) { }

    build(): CoreContext {
        const productCore = this.productCore;
        const orderCore = this.orderCore;
        const customerCore = this.customerCore;
        const offerCore = this.offerCore;
        const hooks = this.hooks;
        const tenantContext = this.tenantContext;

        return {
            product: {
                create: (data) => productCore.create(data),
                findBySku: (sku) => productCore.findBySku(sku),
                findById: (id) => productCore.findById(id),
                findAll: (filters?) => productCore.findAll(filters),
                updateStock: (id, newStock) => productCore.updateStock(id, newStock),
                update: (id, data) => productCore.update(id, data),
            },

            order: {
                create: (data: CreateOrderInput) => orderCore.create(data),
                existsByExternalId: (externalId, pluginName) =>
                    orderCore.existsByExternalId(externalId, pluginName),
                findById: (id) => orderCore.findById(id),
                findAll: (filters?) => orderCore.findAll(filters),
                updateStatus: (id, status: string) => orderCore.updateStatus(id, status as OrderStatus),
            },

            customer: {
                findOrCreate: (data) => customerCore.findOrCreate(data),
                findByEmail: (email) => customerCore.findByEmail(email),
            },

            offer: {
                getForProduct: (productId) => offerCore.getOffersForProduct(productId),
                resolve: (offerId) => offerCore.resolveOffer(offerId),
                setExternalId: (offerId, externalId) => offerCore.setExternalId(offerId, externalId),
                setError: (offerId, error) => offerCore.setError(offerId, error),
                getPending: (productId?) => offerCore.getPendingLinkedOffers(productId),
            },

            mapping: {
                async get(productId: string, pluginName: string) {
                    const tenantId = tenantContext.getTenantId();
                    // Prefer ProductOffer over legacy ExternalProductMapping
                    return (await offerCore.getOffersForProduct(productId))
                        .find(o => o.pluginName === pluginName) ?? null;
                },
                async save(data) {
                    // Legacy: find or create offer
                    const existing = (await offerCore.getOffersForProduct(data.productId))
                        .find(o => o.pluginName === data.pluginName);

                    if (existing) {
                        await offerCore.setExternalId(existing.id, data.externalId);
                    } else {
                        const offer = await offerCore.create(data.productId, data.pluginName, {
                            externalCategory: data.externalCategory,
                        });
                        await offerCore.setExternalId(offer.id, data.externalId);
                    }
                },
            },

            hooks: {
                register: (event: string, handler: (payload: any) => Promise<any>) => {
                    hooks.register(event, handler);
                },
            },
        };
    }
}
