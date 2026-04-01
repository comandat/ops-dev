import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreContextFactory } from '../context/core-context.factory';
import { IPluginBase } from '../interfaces/plugin-base.interface';
import { PluginValidator } from './plugin-validator.service';
import { CapabilityRouter } from '../lifecycle/capability-router.service';
import { TenantContextService } from '../../tenant/tenant-context.service';

export interface DiscoveredPlugin {
    category: string;
    instance: IPluginBase;
}

/**
 * PluginDiscoveryService — Auto-discovers plugins from folder structure.
 *
 * Folder layout:
 *   plugins/
 *     marketplace/
 *       emag-connector/index.js   ← capabilities: ['getOrders', 'updateStock', 'pushProduct']
 *       trendyol-connector/index.js
 *     facturare/
 *       fgo-connector/index.js    ← capabilities: ['emitInvoice']
 *     curierat/                   ← empty = visible category, no plugins yet
 *     anything-new/               ← automatically becomes a new category
 *
 * On load:
 *   1. Scans folders → discovers plugins
 *   2. Validates each plugin (PluginValidator)
 *   3. Wires capabilities to events (CapabilityRouter)
 *   4. Activates plugins saved as active in DB
 *
 * Hot-reload:
 *   - POST /api/plugins/rescan → calls discoverAll() without restart
 *   - fs.watch() on plugins dir → auto-triggers rescan on file changes
 */
@Injectable()
export class PluginDiscoveryService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PluginDiscoveryService.name);
    private readonly pluginsDir = path.join(process.cwd(), 'plugins');

    /** category → Map<pluginName, IPluginBase> */
    private plugins = new Map<string, Map<string, IPluginBase>>();
    /** All discovered categories (even empty ones) */
    private categories: string[] = [];

    /** fs.watch watcher for hot-reload */
    private watcher: fs.FSWatcher | null = null;
    /** Debounce timer to avoid triggering rescan on every single file event */
    private rescanDebounce: NodeJS.Timeout | null = null;

    constructor(
        private prisma: PrismaService,
        private contextFactory: CoreContextFactory,
        private validator: PluginValidator,
        private capabilityRouter: CapabilityRouter,
        private tenantContext: TenantContextService,
    ) { }

    async onModuleInit() {
        await this.discoverAll();
        await this.activateSavedPlugins();
        this.startWatcher();
    }

    onModuleDestroy() {
        this.stopWatcher();
    }

    // ─── Hot-reload watcher ─────────────────────────────────────────────────

    private startWatcher() {
        if (!fs.existsSync(this.pluginsDir)) return;

        this.logger.log('[HotReload] Watching plugins directory for changes...');
        this.watcher = fs.watch(this.pluginsDir, { recursive: true }, (event, filename) => {
            if (!filename || !filename.endsWith('index.js')) return;
            this.logger.log(`[HotReload] Change detected: ${filename} (${event}) — scheduling rescan`);

            // Debounce: wait 1s after last change before rescanning
            if (this.rescanDebounce) clearTimeout(this.rescanDebounce);
            this.rescanDebounce = setTimeout(() => this.rescan(), 1000);
        });

        this.watcher.on('error', (err) => {
            this.logger.warn(`[HotReload] Watcher error: ${err.message} — falling back to manual rescan only`);
            this.stopWatcher();
        });
    }

    private stopWatcher() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
        if (this.rescanDebounce) {
            clearTimeout(this.rescanDebounce);
            this.rescanDebounce = null;
        }
    }

    /**
     * Rescan the plugins directory and re-activate saved plugins.
     * Called by hot-reload watcher OR manually via POST /api/plugins/rescan.
     */
    async rescan(): Promise<{ added: string[]; removed: string[]; total: number }> {
        this.logger.log('[PluginDiscovery] Rescanning plugins directory...');

        const before = new Set(this.getAllPluginNames());

        // Reset state
        this.plugins = new Map();
        this.categories = [];

        await this.discoverAll();
        await this.activateSavedPlugins();

        const after = new Set(this.getAllPluginNames());
        const added = [...after].filter(x => !before.has(x));
        const removed = [...before].filter(x => !after.has(x));

        this.logger.log(`[PluginDiscovery] Rescan complete. Added: [${added.join(', ')}], Removed: [${removed.join(', ')}]`);
        return { added, removed, total: after.size };
    }

    private getAllPluginNames(): string[] {
        const names: string[] = [];
        for (const [, map] of this.plugins) {
            for (const name of map.keys()) names.push(name);
        }
        return names;
    }

    // ─── Discovery ──────────────────────────────────────────────────────────

    async discoverAll() {
        if (!fs.existsSync(this.pluginsDir)) {
            this.logger.warn(`Plugins directory not found: ${this.pluginsDir}`);
            return;
        }

        const categoryDirs = fs.readdirSync(this.pluginsDir).filter(f =>
            fs.statSync(path.join(this.pluginsDir, f)).isDirectory(),
        );

        this.categories = categoryDirs;
        this.logger.log(`Discovered ${categoryDirs.length} plugin categories: ${categoryDirs.join(', ')}`);

        for (const category of categoryDirs) {
            const categoryPath = path.join(this.pluginsDir, category);
            const pluginDirs = fs.readdirSync(categoryPath).filter(f =>
                fs.statSync(path.join(categoryPath, f)).isDirectory(),
            );

            if (!this.plugins.has(category)) {
                this.plugins.set(category, new Map());
            }

            for (const pluginDir of pluginDirs) {
                const indexPath = path.join(categoryPath, pluginDir, 'index.js');
                if (!fs.existsSync(indexPath)) {
                    this.logger.warn(`No index.js found in ${category}/${pluginDir}, skipping`);
                    continue;
                }

                try {
                    // Clear require cache so hot-reload picks up new code
                    delete require.cache[require.resolve(indexPath)];
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    const mod = require(indexPath);
                    const PluginClass = mod.default || mod;
                    const instance: IPluginBase = new PluginClass();

                    instance.manifest.category = category;
                    if (!instance.manifest.capabilities) {
                        instance.manifest.capabilities = [];
                    }

                    const validation = this.validator.validate(instance, indexPath);
                    if (!validation.valid) {
                        this.logger.error(`Plugin ${category}/${pluginDir} failed validation — NOT loaded`);
                        continue;
                    }

                    this.plugins.get(category)!.set(instance.manifest.name, instance);
                    await this.ensureConfigExists(instance);

                    this.logger.log(`Loaded: [${category}] ${instance.manifest.name} v${instance.manifest.version} | capabilities: [${instance.manifest.capabilities.join(', ')}]`);
                } catch (err) {
                    this.logger.error(`Failed to load plugin ${category}/${pluginDir}: ${err.message}`);
                }
            }
        }
    }

    // ─── Activation ─────────────────────────────────────────────────────────

    private async activateSavedPlugins() {
        const activeConfigs = await this.prisma.pluginConfig.findMany({
            where: { isActive: true },
        });

        const ctx = this.contextFactory.build();

        for (const config of activeConfigs) {
            const instance = this.getPluginInstance(config.pluginName);
            if (!instance) continue;

            try {
                const settings = JSON.parse(config.settings || '{}');
                await instance.onLoad(settings, ctx);
                this.capabilityRouter.wire(instance);
                this.logger.log(`Activated: ${config.pluginName}`);
            } catch (err) {
                this.logger.error(`Failed to activate ${config.pluginName}: ${err.message}`);
            }
        }
    }

    private async ensureConfigExists(plugin: IPluginBase) {
        const tenantId = this.tenantContext.getTenantId();
        const existing = await this.prisma.pluginConfig.findUnique({
            where: { pluginName_tenantId: { pluginName: plugin.manifest.name, tenantId } },
        });
        if (!existing) {
            await this.prisma.pluginConfig.create({
                data: {
                    pluginName: plugin.manifest.name,
                    tenantId,
                    isActive: false,
                    settings: '{}',
                },
            });
        }
    }

    // ─── Public API ─────────────────────────────────────────────────────────

    getCategories(): string[] {
        return this.categories;
    }

    async getPluginsWithStatus() {
        const tenantId = this.tenantContext.getTenantId();
        const dbConfigs = await this.prisma.pluginConfig.findMany({ where: { tenantId } });
        const configMap = new Map(dbConfigs.map(c => [c.pluginName, c]));

        const result = [];
        for (const category of this.categories) {
            const categoryPlugins = this.plugins.get(category) || new Map();
            const plugins = [];

            for (const [name, instance] of categoryPlugins) {
                const dbConfig = configMap.get(name);
                const settings = dbConfig ? JSON.parse(dbConfig.settings || '{}') : {};
                const hasCredentials = Object.keys(settings).length > 0;

                plugins.push({
                    name: instance.manifest.name,
                    version: instance.manifest.version,
                    description: instance.manifest.description,
                    author: instance.manifest.author,
                    category,
                    capabilities: instance.manifest.capabilities || [],
                    isActive: dbConfig?.isActive ?? false,
                    hasCredentials,
                    configFields: instance.manifest.configFields,
                });
            }

            result.push({ category, plugins });
        }

        return result;
    }

    getPluginInstance(pluginName: string): IPluginBase | undefined {
        for (const [, categoryPlugins] of this.plugins) {
            if (categoryPlugins.has(pluginName)) {
                return categoryPlugins.get(pluginName);
            }
        }
        return undefined;
    }

    async togglePlugin(pluginName: string, isActive: boolean) {
        const instance = this.getPluginInstance(pluginName);
        if (!instance) {
            return { success: false, message: `Plugin '${pluginName}' not found` };
        }

        const tenantId = this.tenantContext.getTenantId();
        await this.prisma.pluginConfig.update({
            where: { pluginName_tenantId: { pluginName, tenantId } },
            data: { isActive },
        });

        if (isActive) {
            const dbConfig = await this.prisma.pluginConfig.findUnique({
                where: { pluginName_tenantId: { pluginName, tenantId } },
            });
            const settings = JSON.parse(dbConfig?.settings || '{}');
            const ctx = this.contextFactory.build();
            await instance.onLoad(settings, ctx);
            this.capabilityRouter.wire(instance);
        } else {
            if (instance.onUnload) await instance.onUnload();
            this.capabilityRouter.unwire(pluginName);
        }

        return { success: true, isActive };
    }

    async saveSettings(pluginName: string, settings: Record<string, string>) {
        const tenantId = this.tenantContext.getTenantId();
        await this.prisma.pluginConfig.update({
            where: { pluginName_tenantId: { pluginName, tenantId } },
            data: { settings: JSON.stringify(settings) },
        });

        const dbConfig = await this.prisma.pluginConfig.findUnique({
            where: { pluginName_tenantId: { pluginName, tenantId } },
        });
        if (dbConfig?.isActive) {
            const instance = this.getPluginInstance(pluginName);
            if (instance) {
                const ctx = this.contextFactory.build();
                await instance.onLoad(settings, ctx);
                this.capabilityRouter.unwire(pluginName);
                this.capabilityRouter.wire(instance);
            }
        }

        return { success: true };
    }
}
