import { Module } from '@nestjs/common';
import { DeveloperApiController } from './developer-api.controller';
import { ProductCoreModule } from '../core/product/product.module';
import { OrderCoreModule } from '../core/order/order.module';

@Module({
  imports: [ProductCoreModule, OrderCoreModule],
  controllers: [DeveloperApiController],
})
export class DeveloperApiModule { }
