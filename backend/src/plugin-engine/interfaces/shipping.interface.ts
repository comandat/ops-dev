import { IPluginBase } from './plugin-base.interface';

/**
 * AWB generation result returned by generateAWB().
 */
export interface AWBResult {
    success: boolean;
    awbNumber?: string;
    trackingUrl?: string;
    labelPdfUrl?: string;
    estimatedDelivery?: string;
    message?: string;
}

/**
 * Shipment tracking status.
 */
export interface TrackingStatus {
    status: string;
    location?: string;
    timestamp: string;
    details?: string;
}

/**
 * IShippingPlugin — For courier/shipping integrations (FAN Courier, Cargus, DPD, etc.)
 *
 * Plugins in the `plugins/curierat/` folder should implement this interface.
 * Provides methods for AWB generation, shipment tracking, and label printing.
 */
export interface IShippingPlugin extends IPluginBase {
    /**
     * Generate an AWB (waybill) for an order.
     */
    generateAWB(orderId: string, shipmentData: Record<string, any>): Promise<AWBResult>;

    /**
     * Track a shipment by AWB number.
     */
    trackShipment?(awbNumber: string): Promise<TrackingStatus[]>;

    /**
     * Cancel a previously generated AWB.
     */
    cancelAWB?(awbNumber: string): Promise<boolean>;

    /**
     * Get available shipping services/rates for a destination.
     */
    getShippingRates?(destination: Record<string, any>): Promise<Array<{
        serviceName: string;
        price: number;
        estimatedDays: number;
    }>>;
}
