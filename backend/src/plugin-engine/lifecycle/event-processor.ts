import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CapabilityRouter } from '../lifecycle/capability-router.service';

/**
 * EventProcessor — BullMQ Worker that consumes the 'core-events' queue.
 *
 * This is the missing link that was previously causing events to be
 * "emitted" into Redis but never actually delivered to plugins.
 *
 * Flow:
 *   1. ProductCore / OrderCore emits event → EventBusService adds to BullMQ queue
 *   2. EventProcessor picks up the job from Redis
 *   3. Dispatches to CapabilityRouter
 *   4. CapabilityRouter calls all subscribed plugin handlers
 *
 * Events handled:
 *   - 'inventory.updated' → plugins with 'updateStock' capability
 *   - 'order.created'     → plugins with 'emitInvoice' / 'generateAWB' capability
 *   - 'order.updated'     → plugins with 'onOrderUpdated' capability
 *   - 'product.created'   → logged (hooks handled synchronously)
 */
@Processor('core-events')
export class EventProcessor extends WorkerHost {
    private readonly logger = new Logger(EventProcessor.name);

    constructor(private readonly capabilityRouter: CapabilityRouter) {
        super();
    }

    async process(job: Job): Promise<void> {
        const { name: event, data: payload } = job;

        this.logger.log(`[EventProcessor] Processing: ${event} (job ${job.id})`);

        try {
            await this.capabilityRouter.dispatch(event, payload);
        } catch (err) {
            this.logger.error(`[EventProcessor] Dispatch failed for ${event}: ${err.message}`);
            throw err; // Re-throw so BullMQ marks job as failed (keeps it for debugging)
        }
    }
}
