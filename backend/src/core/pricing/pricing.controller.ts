import { Controller, Get, Post, Delete, Put, Body, Param, Query } from '@nestjs/common';
import { PricingService } from './pricing.service';
import type { CreatePricingRuleInput, UpdatePricingRuleInput } from './pricing.service';

@Controller('api/pricing-rules')
export class PricingController {
    constructor(private readonly pricingService: PricingService) { }

    @Get()
    findAll(@Query('pluginName') pluginName?: string) {
        return this.pricingService.findAll(pluginName);
    }

    @Post()
    create(@Body() body: CreatePricingRuleInput) {
        return this.pricingService.create(body);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() body: UpdatePricingRuleInput,
    ) {
        return this.pricingService.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.pricingService.remove(id);
    }
}
