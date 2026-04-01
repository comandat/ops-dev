/**
 * PluginCapability — Declares what a plugin can do.
 * The CapabilityRouter reads this to auto-wire plugins to Core events and cron jobs.
 *
 * | Capability        | Auto-wired to                              |
 * |-------------------|--------------------------------------------|
 * | getOrders         | CronScheduler (every 15 min)               |
 * | pushProduct       | Exposed via UI "Push to Marketplace" btn   |
 * | updateStock       | EventBus 'inventory.updated'               |
 * | onOrderUpdated    | EventBus 'order.updated'                   |
 * | emitInvoice       | EventBus 'order.afterCreate'               |
 * | generateAWB       | EventBus 'order.afterCreate' (post-invoice)|
 */
export type PluginCapability =
    | 'getOrders'
    | 'pushProduct'
    | 'updateStock'
    | 'onOrderUpdated'
    | 'emitInvoice'
    | 'generateAWB'
    | 'trackShipment';

/**
 * PluginManifest — Metadata for any OpenSales plugin.
 * Category is auto-detected from the folder structure (plugins/{category}/{name}).
 */
export interface PluginManifest {
    name: string;
    version: string;
    author: string;
    description: string;
    /** Auto-assigned by PluginDiscovery from the folder name. Do NOT hardcode. */
    category?: string;
    /**
     * Declare what this plugin can do. The platform auto-wires based on this.
     * Example: ['getOrders', 'updateStock'] → auto-scheduled + auto-subscribed to inventory events.
     */
    capabilities: PluginCapability[];
    configFields: ConfigField[];
}

export interface ConfigField {
    key: string;
    label: string;
    type: 'string' | 'password' | 'boolean' | 'number' | 'select';
    required: boolean;
    options?: string[]; // For 'select' type
    defaultValue?: string;
}

/**
 * IPluginBase — The minimal interface that EVERY plugin must implement.
 * Specialized interfaces (IMarketplacePlugin, IInvoicingPlugin, etc.) extend this.
 */
export interface IPluginBase {
    manifest: PluginManifest;

    /**
     * Called when the plugin is activated or credentials are updated.
     * @param config  The key-value settings saved by the user.
     * @param ctx     The CoreContext providing access to Core Modules.
     */
    onLoad(config: Record<string, string>, ctx: CoreContext): Promise<void>;

    /**
     * Optional cleanup when plugin is deactivated.
     */
    onUnload?(): Promise<void>;
}

// ─── CoreContext (injected into plugins) ────────────────────────────────────

/**
 * CoreContext — The gateway for plugins to access OpenSales Core Modules.
 * Built by CoreContextFactory as a proxy to ProductCore, OrderCore, etc.
 */
export interface CoreContext {
    product: CoreProductAPI;
    order: CoreOrderAPI;
    customer: CoreCustomerAPI;
    offer: CoreOfferAPI;
    mapping: CoreMappingAPI; // legacy alias — proxied through offer
    hooks: CoreHookAPI;
}

export interface CoreProductAPI {
    create(data: {
        sku: string;
        name: string;
        price: number;
        stock?: number;
        description?: string;
    }): Promise<any>;
    findBySku(sku: string): Promise<any | null>;
    findById(id: string): Promise<any | null>;
    findAll(filters?: any): Promise<any>;
    updateStock(id: string, newStock: number): Promise<void>;
    update(id: string, data: Record<string, any>): Promise<any>;
}

export interface CoreOrderAPI {
    create(data: {
        orderNumber: string;
        status: string;
        total: number;
        sourcePlugin: string;
        externalId: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
    }): Promise<any>;
    existsByExternalId(externalId: string, pluginName: string): Promise<boolean>;
    findById(id: string): Promise<any | null>;
    findAll(filters?: any): Promise<any>;
    updateStatus(id: string, status: string): Promise<void>;
}

export interface CoreCustomerAPI {
    findOrCreate(data: { email: string; name: string; phone?: string; address?: string }): Promise<any>;
    findByEmail(email: string): Promise<any | null>;
}

export interface CoreOfferAPI {
    getForProduct(productId: string): Promise<any[]>;
    resolve(offerId: string): Promise<any | null>;
    setExternalId(offerId: string, externalId: string): Promise<any>;
    setError(offerId: string, error: string): Promise<any>;
    getPending(productId?: string): Promise<any[]>;
}

// Legacy mapping API — now proxied through OfferCore
export interface CoreMappingAPI {
    get(productId: string, pluginName: string): Promise<{ externalId: string | null } | null>;
    save(data: {
        productId: string;
        pluginName: string;
        externalId: string;
        externalCategory?: string;
    }): Promise<void>;
}

export interface CoreHookAPI {
    register(event: string, handler: (payload: any) => Promise<any>): void;
}
