import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PluginDiscoveryService } from './discovery/plugin-discovery.service';
import { CronScheduler } from './lifecycle/cron-scheduler.service';
import { CapabilityRouter } from './lifecycle/capability-router.service';

/**
 * Plugin Engine REST API.
 *
 * GET  /api/plugins                      → All plugins grouped by auto-discovered categories
 * GET  /api/plugins/categories            → Just the category names
 * GET  /api/plugins/runtime-status        → Per-plugin last success/error/timeout state
 * POST /api/plugins/rescan               → Hot-reload: re-scan plugins dir without restart
 * POST /api/plugins/:name/toggle         → Toggle plugin on/off (auto-wires/unwires capabilities)
 * POST /api/plugins/:name/settings       → Save plugin credentials + re-wire
 * POST /api/plugins/:name/sync-orders    → Trigger order sync for a specific plugin
 * POST /api/plugins/:name/push-product   → Push a product to a marketplace plugin
 * POST /api/plugins/sync-all-orders      → Trigger order sync for ALL active plugins
 */
@Controller('api/plugins')
export class PluginEngineController {
    constructor(
        private discovery: PluginDiscoveryService,
        private cronScheduler: CronScheduler,
        private capabilityRouter: CapabilityRouter,
    ) { }

    @Get()
    async getAll() {
        return this.discovery.getPluginsWithStatus();
    }

    @Get('categories')
    getCategories() {
        return this.discovery.getCategories();
    }

    /** Runtime monitoring: last success, last error, timeout state per plugin */
    @Get('runtime-status')
    getRuntimeStatus() {
        return this.capabilityRouter.getRuntimeState();
    }

    /**
     * Hot-reload: re-scan plugins directory and re-activate without restarting the server.
     * Drop a new plugin folder → hit this endpoint → it's live.
     */
    @Post('rescan')
    async rescan() {
        return this.discovery.rescan();
    }

    /** Trigger order sync for ALL active plugins (runs in parallel, isolated) */
    @Post('sync-all-orders')
    async syncAllOrders() {
        return this.cronScheduler.triggerManualSync();
    }

    @Post(':name/toggle')
    async togglePlugin(
        @Param('name') name: string,
        @Body() body: { isActive: boolean },
    ) {
        return this.discovery.togglePlugin(name, body.isActive);
    }

    @Post(':name/settings')
    async saveSettings(
        @Param('name') name: string,
        @Body() body: { settings: Record<string, string> },
    ) {
        return this.discovery.saveSettings(name, body.settings);
    }

    /** Trigger getOrders() on a specific plugin */
    @Post(':name/sync-orders')
    async syncOrders(@Param('name') name: string) {
        const instance = this.discovery.getPluginInstance(name) as any;
        if (!instance) {
            return { success: false, message: `Plugin '${name}' not found` };
        }
        if (!instance.manifest.capabilities?.includes('getOrders')) {
            return { success: false, message: `Plugin '${name}' does not have 'getOrders' capability` };
        }
        await instance.getOrders();
        return { success: true };
    }

    /** Push a Core product to a marketplace plugin */
    @Post(':name/push-product')
    async pushProduct(
        @Param('name') name: string,
        @Body() body: { productId: string; productData: Record<string, any> },
    ) {
        const instance = this.discovery.getPluginInstance(name) as any;
        if (!instance) {
            return { success: false, message: `Plugin '${name}' not found` };
        }
        if (!instance.manifest.capabilities?.includes('pushProduct')) {
            return { success: false, message: `Plugin '${name}' does not have 'pushProduct' capability` };
        }
        const result = await instance.pushProduct(body.productId, body.productData);
        return { success: result };
    }
}
