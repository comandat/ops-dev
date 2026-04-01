import { IPluginBase } from './plugin-base.interface';

/**
 * IMarketplacePlugin — For marketplace integrations (eMAG, Trendyol, Amazon, etc.)
 *
 * Plugins in the `plugins/marketplace/` folder should implement this interface.
 * Provides methods for order import, product push, and stock synchronization.
 */
export interface IMarketplacePlugin extends IPluginBase {
    /**
     * Fetch new/unacknowledged orders from the external marketplace
     * and save them to Core via ctx.order.create().
     */
    getOrders(): Promise<void>;

    /**
     * Push a Core product as an offer/listing to the external marketplace.
     * After success, should call ctx.mapping.save() with the returned external ID.
     */
    pushProduct(productId: string, productData: Record<string, any>): Promise<boolean>;

    /**
     * Sync stock quantity for a product to the external marketplace.
     * Uses ctx.mapping.get() to find the external offer ID.
     */
    updateStock(productId: string, newStock: number): Promise<boolean>;

    /**
     * Optional: called when a Core order status changes.
     * Plugin should forward the status change to the external marketplace.
     */
    onOrderUpdated?(orderId: string, newStatus: string): Promise<void>;
}
