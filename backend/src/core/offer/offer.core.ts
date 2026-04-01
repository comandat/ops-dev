import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContextService } from '../../tenant/tenant-context.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationService } from '../notification/notification.service';
import { PricingService } from '../pricing/pricing.service';

export interface ResolvedOffer {
    id: string;
    tenantId: string;
    productId: string;
    pluginName: string;
    externalId: string | null;
    // Effective values (override ?? product master)
    title: string;
    description: string | null;
    images: string | null;
    price: number;
    externalCategory: string | null;
    // Sync state
    isLinked: boolean;
    isActive: boolean;
    status: string;
    lastSyncError: string | null;
    lastSyncAt: Date | null;
    // Raw offer fields (to know what is overridden vs inherited)
    _overrides: {
        title: string | null;
        description: string | null;
        images: string | null;
        price: number | null;
    };
}

@Injectable()
export class OfferCore {
    constructor(
        private prisma: PrismaService,
        private tenantContext: TenantContextService,
        private activity: ActivityService,
        private notifications: NotificationService,
        private pricing: PricingService,
    ) { }

    private get tenantId() { return this.tenantContext.getTenantId(); }

    // ─── Create ─────────────────────────────────────────────────────────────

    async create(productId: string, pluginName: string, overrides?: {
        title?: string;
        description?: string;
        images?: string;
        price?: number;
        externalCategory?: string;
    }) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, tenantId: this.tenantId },
        });
        if (!product) throw new Error(`Product ${productId} not found`);

        const offer = await this.prisma.productOffer.create({
            data: {
                tenantId: this.tenantId,
                productId,
                pluginName,
                title: overrides?.title ?? null,
                description: overrides?.description ?? null,
                images: overrides?.images ?? null,
                price: overrides?.price ?? null,
                externalCategory: overrides?.externalCategory ?? null,
                isLinked: true,
                isActive: true,
                status: 'DRAFT',
            },
        });

        await this.activity.log(
            `offer:${pluginName}`,
            'offer.created',
            JSON.stringify({ offerId: offer.id, productId, pluginName }),
        );

        return offer;
    }

    // ─── Read ────────────────────────────────────────────────────────────────

    async getOffersForProduct(productId: string) {
        return this.prisma.productOffer.findMany({
            where: { productId, tenantId: this.tenantId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getOffer(offerId: string) {
        return this.prisma.productOffer.findFirst({
            where: { id: offerId, tenantId: this.tenantId },
        });
    }

    /**
     * Resolves effective values: override ?? product master.
     * This is what gets sent to the marketplace plugin.
     */
    async resolveOffer(offerId: string): Promise<ResolvedOffer | null> {
        const offer = await this.prisma.productOffer.findFirst({
            where: { id: offerId, tenantId: this.tenantId },
            include: { product: true },
        });
        if (!offer) return null;

        return {
            id: offer.id,
            tenantId: offer.tenantId,
            productId: offer.productId,
            pluginName: offer.pluginName,
            externalId: offer.externalId,
            // Effective = override ?? pricing rule ?? master price
            title: offer.title ?? offer.product.name,
            description: offer.description ?? offer.product.description ?? null,
            images: offer.images ?? offer.product.images ?? null,
            price: offer.price ?? await this.pricing.computeListingPrice(offer.product.price, offer.pluginName),
            externalCategory: offer.externalCategory,
            isLinked: offer.isLinked,
            isActive: offer.isActive,
            status: offer.status,
            lastSyncError: offer.lastSyncError,
            lastSyncAt: offer.lastSyncAt,
            _overrides: {
                title: offer.title,
                description: offer.description,
                images: offer.images,
                price: offer.price,
            },
        };
    }

    // ─── Update ──────────────────────────────────────────────────────────────

    async update(offerId: string, data: {
        title?: string | null;
        description?: string | null;
        images?: string | null;
        price?: number | null;
        externalCategory?: string | null;
    }) {
        return this.prisma.productOffer.updateMany({
            where: { id: offerId, tenantId: this.tenantId },
            data,
        });
    }

    async setExternalId(offerId: string, externalId: string) {
        return this.prisma.productOffer.updateMany({
            where: { id: offerId, tenantId: this.tenantId },
            data: { externalId, status: 'SYNCED', lastSyncAt: new Date(), lastSyncError: null },
        });
    }

    async setError(offerId: string, error: string) {
        return this.prisma.productOffer.updateMany({
            where: { id: offerId, tenantId: this.tenantId },
            data: { status: 'ERROR', lastSyncError: error },
        });
    }

    // ─── Toggle ──────────────────────────────────────────────────────────────

    /**
     * Toggle isActive: deactivates/activates the listing on the marketplace.
     * Returns the updated offer.
     */
    async toggleActive(offerId: string, isActive: boolean) {
        await this.prisma.productOffer.updateMany({
            where: { id: offerId, tenantId: this.tenantId },
            data: {
                isActive,
                status: isActive ? 'PENDING' : 'INACTIVE',
            },
        });

        const offer = await this.getOffer(offerId);
        await this.activity.log(
            `offer:${offer?.pluginName}`,
            isActive ? 'offer.activated' : 'offer.deactivated',
            JSON.stringify({ offerId }),
        );

        return offer;
    }

    /**
     * Toggle isLinked: connects/disconnects the offer from the product master.
     * When disconnected, product updates won't propagate here.
     */
    async toggleLinked(offerId: string, isLinked: boolean) {
        await this.prisma.productOffer.updateMany({
            where: { id: offerId, tenantId: this.tenantId },
            data: { isLinked },
        });

        const offer = await this.getOffer(offerId);
        await this.activity.log(
            `offer:${offer?.pluginName}`,
            isLinked ? 'offer.linked' : 'offer.unlinked',
            JSON.stringify({ offerId }),
        );

        return offer;
    }

    async remove(offerId: string) {
        return this.prisma.productOffer.deleteMany({
            where: { id: offerId, tenantId: this.tenantId },
        });
    }

    // ─── Propagation ─────────────────────────────────────────────────────────

    /**
     * Called when a Product is updated.
     * Sets status = PENDING on all linked offers so the next sync picks them up.
     */
    async markLinkedOffersAsPending(productId: string) {
        const result = await this.prisma.productOffer.updateMany({
            where: {
                productId,
                tenantId: this.tenantId,
                isLinked: true,
                isActive: true,
            },
            data: { status: 'PENDING' },
        });

        if (result.count > 0) {
            await this.activity.log(
                'system',
                'offer.propagation_queued',
                JSON.stringify({ productId, offersMarked: result.count }),
            );

            this.notifications.info(this.tenantId, `Sincronizare inițiată pentru ${result.count} oferte conectate.`);
        }

        return result.count;
    }

    /**
     * Get all PENDING linked offers (for sync engine to process).
     */
    async getPendingLinkedOffers(productId?: string) {
        return this.prisma.productOffer.findMany({
            where: {
                tenantId: this.tenantId,
                isLinked: true,
                isActive: true,
                status: 'PENDING',
                ...(productId ? { productId } : {}),
            },
            include: { product: true },
        });
    }
}
