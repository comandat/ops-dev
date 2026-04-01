import { IPluginBase } from './plugin-base.interface';

/**
 * Invoice emission result returned by emitInvoice().
 */
export interface InvoiceResult {
    success: boolean;
    invoiceNumber?: string;
    invoiceSeries?: string;
    pdfLink?: string;
    message?: string;
}

/**
 * IInvoicingPlugin — For invoicing/billing integrations (FGO, SmartBill, Oblio, etc.)
 *
 * Plugins in the `plugins/facturare/` folder should implement this interface.
 * Provides methods for invoice emission, status checking, cancellation, and payments.
 */
export interface IInvoicingPlugin extends IPluginBase {
    /**
     * Emit an invoice for a Core order.
     * Called automatically when an order is created (if configured) or manually.
     */
    emitInvoice(orderId: string, orderData: Record<string, any>): Promise<InvoiceResult>;

    /**
     * Get the status of an emitted invoice (paid amount, payment history, etc.)
     */
    getInvoiceStatus?(series: string, number: string): Promise<any>;

    /**
     * Cancel a previously emitted invoice.
     */
    cancelInvoice?(series: string, number: string): Promise<boolean>;

    /**
     * Reverse/storno an invoice, creating a credit note.
     */
    reverseInvoice?(series: string, number: string): Promise<InvoiceResult>;

    /**
     * Record a payment against an invoice.
     */
    recordPayment?(series: string, number: string, amount: number, date: string): Promise<boolean>;
}
