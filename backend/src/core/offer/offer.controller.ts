import {
    Controller, Get, Post, Put, Delete,
    Param, Body,
} from '@nestjs/common';
import { OfferTemplateService } from './offer-template.service';
import type { CreateOfferTemplateInput } from './offer-template.service';
import { OfferCore } from './offer.core';

@Controller()
export class OfferController {
    constructor(
        private readonly offerCore: OfferCore,
        private readonly offerTemplateService: OfferTemplateService,
    ) { }

    // ─── Offer Endpoints ─────────────────────────────────────────────────────

    @Get('api/products/:productId/offers')
    getOffersForProduct(@Param('productId') productId: string) {
        return this.offerCore.getOffersForProduct(productId);
    }

    @Post('api/products/:productId/offers')
    createOffer(
        @Param('productId') productId: string,
        @Body() body: {
            pluginName: string;
            title?: string;
            description?: string;
            images?: string;
            price?: number;
            externalCategory?: string;
        },
    ) {
        const { pluginName, ...overrides } = body;
        return this.offerCore.create(productId, pluginName, overrides);
    }

    @Get('api/offers/:offerId')
    getOffer(@Param('offerId') offerId: string) {
        return this.offerCore.getOffer(offerId);
    }

    @Get('api/offers/:offerId/resolved')
    resolveOffer(@Param('offerId') offerId: string) {
        return this.offerCore.resolveOffer(offerId);
    }

    @Put('api/offers/:offerId')
    updateOffer(
        @Param('offerId') offerId: string,
        @Body() body: {
            title?: string | null;
            description?: string | null;
            images?: string | null;
            price?: number | null;
            externalCategory?: string | null;
        },
    ) {
        return this.offerCore.update(offerId, body);
    }

    @Put('api/offers/:offerId/toggle-active')
    toggleActive(
        @Param('offerId') offerId: string,
        @Body('isActive') isActive: boolean,
    ) {
        return this.offerCore.toggleActive(offerId, isActive);
    }

    @Put('api/offers/:offerId/toggle-linked')
    toggleLinked(
        @Param('offerId') offerId: string,
        @Body('isLinked') isLinked: boolean,
    ) {
        return this.offerCore.toggleLinked(offerId, isLinked);
    }

    @Delete('api/offers/:offerId')
    remove(@Param('offerId') offerId: string) {
        return this.offerCore.remove(offerId);
    }

    // ─── Template Endpoints ──────────────────────────────────────────────────

    @Get('api/offer-templates')
    getTemplates(@Param('pluginName') pluginName?: string) {
        return this.offerTemplateService.findAll(pluginName);
    }

    @Post('api/offer-templates')
    createTemplate(@Body() body: CreateOfferTemplateInput) {
        return this.offerTemplateService.create(body);
    }

    @Delete('api/offer-templates/:id')
    deleteTemplate(@Param('id') id: string) {
        return this.offerTemplateService.remove(id);
    }

    @Post('api/offer-templates/:id/apply/:productId')
    applyTemplate(
        @Param('id') id: string,
        @Param('productId') productId: string,
    ) {
        return this.offerTemplateService.applyToProduct(id, productId);
    }
}
