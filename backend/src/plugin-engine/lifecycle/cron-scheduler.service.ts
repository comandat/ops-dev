import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CapabilityRouter } from './capability-router.service';

const PLUGIN_TIMEOUT_MS = parseInt(process.env.PLUGIN_TIMEOUT_MS || '30000', 10);

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`[Timeout] ${label} exceeded ${ms}ms`)), ms),
        ),
    ]);
}

/**
 * CronScheduler — Automatically runs getOrders() for all plugins that declare it.
 *
 * Crash Isolation:
 *   - Each plugin's getOrders() runs inside withTimeout() — a hung plugin is killed after 30s.
 *   - All plugins run via Promise.allSettled() — one failure does NOT stop the others.
 *   - Per-sync result report shows which plugins succeeded and which failed.
 */
@Injectable()
export class CronScheduler implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(CronScheduler.name);
    private timer: NodeJS.Timeout | null = null;

    private readonly intervalMs = parseInt(
        process.env.PLUGIN_ORDER_SYNC_INTERVAL_MS || String(15 * 60 * 1000),
        10,
    );

    constructor(private readonly capabilityRouter: CapabilityRouter) { }

    onModuleInit() {
        this.logger.log(
            `[CronScheduler] Starting order sync cron (interval: ${this.intervalMs / 1000}s, timeout: ${PLUGIN_TIMEOUT_MS / 1000}s/plugin)`,
        );
        setTimeout(() => this.runOrderSync(), 5000);
        this.timer = setInterval(() => this.runOrderSync(), this.intervalMs);
    }

    onModuleDestroy() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
    }

    async triggerManualSync(): Promise<{ pluginsSynced: string[]; pluginsFailed: string[] }> {
        return this.runOrderSync();
    }

    private async runOrderSync(): Promise<{ pluginsSynced: string[]; pluginsFailed: string[] }> {
        const fetchers = this.capabilityRouter.getOrderFetchers();

        if (fetchers.size === 0) {
            this.logger.debug('[CronScheduler] No plugins with getOrders capability — skipping');
            return { pluginsSynced: [], pluginsFailed: [] };
        }

        this.logger.log(`[CronScheduler] Order sync running for ${fetchers.size} plugin(s)`);

        const entries = [...fetchers.entries()];

        // ── Run ALL plugins in parallel, fully isolated ──────────────────────
        const results = await Promise.allSettled(
            entries.map(async ([pluginName, fetchFn]) => {
                this.logger.log(`[CronScheduler] → ${pluginName}.getOrders()`);
                await withTimeout(fetchFn(), PLUGIN_TIMEOUT_MS, `${pluginName}.getOrders`);
                return pluginName;
            }),
        );

        const pluginsSynced: string[] = [];
        const pluginsFailed: string[] = [];

        results.forEach((result, idx) => {
            const pluginName = entries[idx][0];
            if (result.status === 'fulfilled') {
                pluginsSynced.push(pluginName);
            } else {
                pluginsFailed.push(pluginName);
                const isTimeout = result.reason?.message?.includes('[Timeout]');
                this.logger.error(
                    `[CronScheduler] ${pluginName}.getOrders() ${isTimeout ? 'TIMED OUT' : 'FAILED'}: ${result.reason?.message}`,
                );
            }
        });

        this.logger.log(
            `[CronScheduler] Done. ✅ ${pluginsSynced.join(', ') || 'none'} | ❌ ${pluginsFailed.join(', ') || 'none'}`,
        );

        return { pluginsSynced, pluginsFailed };
    }
}
