import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export type EventType =
    | 'inventory.updated'
    | 'order.created'
    | 'order.updated'
    | 'product.created'
    | 'product.updated'
    | 'stock.critical';

@Injectable()
export class EventBusService {
    private readonly logger = new Logger(EventBusService.name);

    constructor(@InjectQueue('core-events') private eventQueue: Queue) { }

    /**
     * Dispatches an asynchronous event to be processed by all active plugins.
     * Format is very functional: true fire and forget so infrastructure outages don't block the API.
     */
    async emit(event: EventType, payload: any) {
        this.logger.log(`Emitting event ${event}`);

        // Fire and forget background job dispatch
        this.eventQueue.add(event, payload, {
            removeOnComplete: true, // Keep the queue slim
            removeOnFail: false,    // But keep failures for debugging
        }).catch(error => {
            this.logger.error(`Failed to emit event ${event}: ${error.message}`);
        });
    }
}
