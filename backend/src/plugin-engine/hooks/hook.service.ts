import { Injectable, Logger } from '@nestjs/common';

/**
 * HookService — Allows plugins to register before/after hooks on Core actions.
 *
 * Hook events follow the pattern: "{module}.{before|after}{Action}"
 * Examples: "product.beforeCreate", "order.afterCreate", "inventory.afterUpdate"
 *
 * Before-hooks can modify the payload (pipeline pattern).
 * After-hooks receive the result, can't modify it.
 */
@Injectable()
export class HookService {
    private readonly logger = new Logger(HookService.name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly hooks = new Map<string, Array<(payload: any) => Promise<any>>>();

    /**
     * Register a hook handler for a given event.
     * @param event The event name (e.g., 'product.beforeCreate')
     * @param handler The async function to execute
     */
    register<T = unknown, R = T>(event: string, handler: (payload: T) => Promise<R>): void {
        if (!this.hooks.has(event)) {
            this.hooks.set(event, []);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.hooks.get(event)!.push(handler as any);
        this.logger.log(`Hook registered: ${event} (${this.hooks.get(event)!.length} handlers)`);
    }

    /**
     * Run all hooks for a given event in order (pipeline).
     * For "before" hooks: each handler can transform the payload, passed to the next.
     * For "after" hooks: all handlers receive the same payload (no transform).
     */
    async run<T, R = T>(event: string, payload: T): Promise<R> {
        const handlers = this.hooks.get(event) || [];
        if (handlers.length === 0) return payload as unknown as R;

        const isBefore = event.includes('.before');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let result: any = payload;

        for (const handler of handlers) {
            try {
                const output = await handler(result);
                if (isBefore && output !== undefined) {
                    result = output; // Pipeline: transform passes to next
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                this.logger.error(`Hook ${event} failed: ${msg}`);
                // Don't break the pipeline — log and continue
            }
        }

        return result as R;
    }

    /**
     * Clear all hooks (called during plugin unload or test teardown).
     */
    clearHooksForPlugin(pluginName: string): void {
        // Future: track which plugin registered which hook for targeted cleanup
        this.logger.log(`Hooks cleared for plugin: ${pluginName}`);
    }

    /**
     * Clear ALL hooks (for testing or full reset).
     */
    clearAll(): void {
        this.hooks.clear();
    }
}
