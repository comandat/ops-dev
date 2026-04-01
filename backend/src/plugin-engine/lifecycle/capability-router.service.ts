import { Injectable, Logger } from '@nestjs/common';
import { IPluginBase } from '../interfaces/plugin-base.interface';

/** Per-plugin runtime state — tracks last run and last error */
export interface PluginRuntimeState {
    lastSuccess: Date | null;
    lastError: string | null;
    lastErrorAt: Date | null;
    isTimedOut: boolean;
}

const PLUGIN_TIMEOUT_MS = parseInt(process.env.PLUGIN_TIMEOUT_MS || '30000', 10); // 30s default

/**
 * Wraps a promise with a timeout. Rejects if it takes longer than `ms` milliseconds.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`[Timeout] ${label} exceeded ${ms}ms`)), ms),
        ),
    ]);
}

/**
 * CapabilityRouter — Auto-wires plugins to Core events based on declared capabilities.
 *
 * Crash Isolation:
 *   - Each plugin handler runs inside withTimeout() — a plugin cannot hang forever.
 *   - Errors are caught per-plugin; one failing plugin does NOT affect others.
 *   - Runtime state (last success, last error) is tracked per plugin.
 */
@Injectable()
export class CapabilityRouter {
    private readonly logger = new Logger(CapabilityRouter.name);

    private eventHandlers = new Map<string, Array<{ pluginName: string; handler: (payload: any) => Promise<void> }>>();
    private orderFetchers = new Map<string, () => Promise<void>>();

    /** Per-plugin runtime state for monitoring */
    private runtimeState = new Map<string, PluginRuntimeState>();

    wire(plugin: IPluginBase): void {
        const { name, capabilities = [] } = plugin.manifest;

        this.runtimeState.set(name, {
            lastSuccess: null, lastError: null, lastErrorAt: null, isTimedOut: false,
        });

        for (const cap of capabilities) {
            switch (cap) {
                case 'updateStock':
                    this.subscribe('inventory.updated', name, async (payload: { productId: string; newStock: number }) => {
                        await (plugin as any).updateStock(payload.productId, payload.newStock);
                    });
                    break;

                case 'onOrderUpdated':
                    this.subscribe('order.updated', name, async (payload: { orderId: string; newStatus: string }) => {
                        await (plugin as any).onOrderUpdated(payload.orderId, payload.newStatus);
                    });
                    break;

                case 'emitInvoice':
                    this.subscribe('order.created', name, async (payload: any) => {
                        const result = await (plugin as any).emitInvoice(payload.id, payload);
                        if (!result?.success) {
                            this.logger.warn(`[${name}] emitInvoice returned failure for order ${payload.id}`);
                        }
                    });
                    break;

                case 'generateAWB':
                    this.subscribe('order.created', name, async (payload: any) => {
                        const result = await (plugin as any).generateAWB(payload.id, payload);
                        if (!result?.success) {
                            this.logger.warn(`[${name}] generateAWB returned failure for order ${payload.id}`);
                        }
                    });
                    break;

                case 'getOrders':
                    this.orderFetchers.set(name, () => (plugin as any).getOrders());
                    this.logger.log(`[CapabilityRouter] ${name} registered for cron order sync`);
                    break;

                case 'pushProduct':
                case 'trackShipment':
                    this.logger.log(`[CapabilityRouter] ${name} has '${cap}' — available via API`);
                    break;
            }
        }
    }

    unwire(pluginName: string): void {
        for (const [event, handlers] of this.eventHandlers) {
            this.eventHandlers.set(event, handlers.filter(h => h.pluginName !== pluginName));
        }
        this.orderFetchers.delete(pluginName);
        this.runtimeState.delete(pluginName);
        this.logger.log(`[CapabilityRouter] ${pluginName} unwired`);
    }

    /**
     * Dispatch an event to all wired handlers — FULLY ISOLATED.
     * A timeout or crash in any plugin does NOT block or affect other plugins.
     */
    async dispatch(event: string, payload: any): Promise<void> {
        const handlers = this.eventHandlers.get(event) || [];
        if (handlers.length === 0) return;

        this.logger.log(`[CapabilityRouter] Dispatching '${event}' to ${handlers.length} plugin(s)`);

        await Promise.allSettled(
            handlers.map(async ({ pluginName, handler }) => {
                const state = this.runtimeState.get(pluginName);
                try {
                    await withTimeout(handler(payload), PLUGIN_TIMEOUT_MS, `${pluginName}::${event}`);
                    if (state) { state.lastSuccess = new Date(); state.isTimedOut = false; }
                } catch (err) {
                    const isTimeout = err.message?.includes('[Timeout]');
                    this.logger.error(
                        `[CapabilityRouter] ${pluginName}::${event} ${isTimeout ? 'TIMED OUT' : 'threw'}: ${err.message}`,
                    );
                    if (state) {
                        state.lastError = err.message;
                        state.lastErrorAt = new Date();
                        state.isTimedOut = isTimeout;
                    }
                    // ↑ Error is CAUGHT — other handlers continue normally
                }
            }),
        );
    }

    getOrderFetchers(): Map<string, () => Promise<void>> {
        return this.orderFetchers;
    }

    getRuntimeState(): Record<string, PluginRuntimeState> {
        return Object.fromEntries(this.runtimeState);
    }

    hasHandlers(event: string): boolean {
        return (this.eventHandlers.get(event) || []).length > 0;
    }

    private subscribe(event: string, pluginName: string, handler: (payload: any) => Promise<void>): void {
        if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, []);
        const current = this.eventHandlers.get(event)!.filter(h => h.pluginName !== pluginName);
        current.push({ pluginName, handler });
        this.eventHandlers.set(event, current);
        this.logger.log(`[CapabilityRouter] ${pluginName} → subscribed to '${event}'`);
    }
}
