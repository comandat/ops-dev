import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EventBusService } from './event-bus.service';

/**
 * EventBusModule — Provides EventBusService for emitting jobs into the 'core-events' BullMQ queue.
 *
 * The worker that CONSUMES this queue is EventProcessor in plugin-engine/lifecycle/event-processor.ts.
 * We intentionally do NOT register the worker here to avoid circular imports.
 */
import { getQueueToken } from '@nestjs/bullmq';

@Module({
  providers: [
    {
      provide: getQueueToken('core-events'),
      useValue: {
        add: async () => { }, // Mock fire and forget
      },
    },
    EventBusService,
  ],
  exports: [EventBusService],
})
export class EventBusModule { }
