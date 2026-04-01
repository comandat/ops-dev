"use strict";

/**
 * Trendyol Connector Plugin for OpenSales
 *
 * API: Trendyol Integration API v3.0 (International Marketplace)
 * Base URL (PROD): https://apigw.trendyol.com/integration
 * Base URL (STAGE): https://stageapigw.trendyol.com/integration
 *
 * Authentication: HTTP Basic Auth
 *   Header: Authorization: Basic base64(apiKey:apiSecret)
 *   Header: User-Agent: {sellerId} - OpenSales
 *
 * Config fields:
 *   - sellerId      : Your numeric Trendyol Seller ID
 *   - apiKey        : API Key from Trendyol Seller Center
 *   - apiSecret     : API Secret from Trendyol Seller Center
 *   - storeFrontCode: Country code, e.g. "RON" for Romania (required for product operations)
 *
 * Key endpoints used:
 *   GET  /order/sellers/{sellerId}/orders               → fetch orders
 *   PUT  /product/sellers/{sellerId}/products/price-and-inventory → update stock & price
 *   POST /product/sellers/{sellerId}/v2/products        → create products
 *   GET  /product/sellers/{sellerId}/products           → filter products
 */

class TrendyolConnector {
    constructor() {
        this.manifest = {
            name: 'trendyol-connector',
            version: '1.1.0',
            author: 'OpenSales Team',
            description: 'Conectare cu Trendyol International Marketplace. Import comenzi, sincronizare stoc & preț.',
            // category auto-assigned from folder name by PluginDiscovery
            capabilities: ['getOrders', 'pushProduct', 'updateStock', 'onOrderUpdated'],
            configFields: [
                { key: 'sellerId', label: 'Seller ID', type: 'string', required: true },
                { key: 'apiKey', label: 'API Key', type: 'password', required: true },
                { key: 'apiSecret', label: 'API Secret', type: 'password', required: true },
                { key: 'storeFrontCode', label: 'StoreFront Code', type: 'string', required: false },
                { key: 'useStage', label: 'Mediu STAGE (test)', type: 'boolean', required: false },
            ],
        };

        this.config = {};
        this.ctx = null;
        this.PLUGIN_NAME = 'trendyol-connector';
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    _baseUrl() {
        const stage = this.config.useStage === 'true' || this.config.useStage === true;
        return stage
            ? 'https://stageapigw.trendyol.com/integration'
            : 'https://apigw.trendyol.com/integration';
    }

    _headers() {
        const hash = Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64');
        return {
            'Authorization': `Basic ${hash}`,
            'Content-Type': 'application/json',
            // Trendyol requires a meaningful User-Agent: "sellerId - AppName"
            'User-Agent': `${this.config.sellerId} - OpenSales`,
        };
    }

    // Optional: add storeFrontCode header for product category operations
    _productHeaders() {
        const base = this._headers();
        if (this.config.storeFrontCode) {
            base['storeFrontCode'] = this.config.storeFrontCode;
        }
        return base;
    }

    async _get(path, params = {}) {
        const url = new URL(`${this._baseUrl()}${path}`);
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
        }
        const resp = await fetch(url.toString(), { method: 'GET', headers: this._headers() });
        if (!resp.ok) throw new Error(`Trendyol GET ${path} → ${resp.status} ${resp.statusText}`);
        return resp.json();
    }

    async _put(path, body) {
        const resp = await fetch(`${this._baseUrl()}${path}`, {
            method: 'PUT',
            headers: this._headers(),
            body: JSON.stringify(body),
        });
        if (!resp.ok) throw new Error(`Trendyol PUT ${path} → ${resp.status} ${resp.statusText}`);
        return resp.json();
    }

    async _post(path, body, extraHeaders = {}) {
        const resp = await fetch(`${this._baseUrl()}${path}`, {
            method: 'POST',
            headers: { ...this._productHeaders(), ...extraHeaders },
            body: JSON.stringify(body),
        });
        if (!resp.ok) throw new Error(`Trendyol POST ${path} → ${resp.status} ${resp.statusText}`);
        return resp.json();
    }

    // ─── IPlugin Implementation ──────────────────────────────────────────────

    async onLoad(config, ctx) {
        this.config = config;
        this.ctx = ctx;
        console.log(`[Trendyol] Loaded. SellerId: ${config.sellerId || 'NOT SET'}`);
    }

    /**
     * Fetches orders from Trendyol for the last 24 hours and saves new ones to Core.
     *
     * Docs: GET /order/sellers/{sellerId}/orders
     * Query params:
     *   - startDate (epoch ms)    : Filter start date
     *   - endDate   (epoch ms)    : Filter end date
     *   - orderByField            : "PackageLastModifiedDate" (recommended by docs)
     *   - orderByDirection        : "ASC"
     *   - status                  : (optional) filter by package status
     *   - size                    : items per page (default 50, max 200)
     *   - page                    : 0-indexed page
     */
    async getOrders() {
        if (!this.config.sellerId || !this.config.apiKey || !this.config.apiSecret) {
            console.error('[Trendyol] Cannot sync orders: credentials not set');
            return;
        }

        const now = Date.now();
        const yesterday = now - 24 * 60 * 60 * 1000;
        const pageSize = 50;
        let page = 0;
        let totalPages = 1; // Will be updated after first response

        const sellerId = this.config.sellerId;

        while (page < totalPages) {
            let data;
            try {
                data = await this._get(`/order/sellers/${sellerId}/orders`, {
                    startDate: yesterday,
                    endDate: now,
                    orderByField: 'PackageLastModifiedDate',
                    orderByDirection: 'ASC',
                    size: pageSize,
                    page,
                });
            } catch (err) {
                console.error(`[Trendyol] getOrders page ${page} failed:`, err.message);
                break;
            }

            // Update total pages from response
            if (data.totalPages !== undefined) totalPages = data.totalPages;

            const packages = data.content || [];
            console.log(`[Trendyol] Page ${page + 1}/${totalPages}: ${packages.length} packages`);

            for (const pkg of packages) {
                // Each package can contain multiple lines (orders). We create one Core order per package.
                const externalId = String(pkg.id);
                const alreadyExists = await this.ctx.order.existsByExternalId(externalId, this.PLUGIN_NAME);
                if (alreadyExists) continue;

                // Total price = sum of all lines' amount
                const total = (pkg.lines || []).reduce((sum, l) => {
                    return sum + ((l.amount || 0) * (l.quantity || 1));
                }, 0);

                // Customer info from shipmentAddress
                const addr = pkg.shipmentAddress || {};
                const customerName = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || 'Trendyol Customer';

                try {
                    await this.ctx.order.create({
                        orderNumber: `TY-${pkg.orderNumber || pkg.id}`,
                        status: 'NEW',
                        total,
                        sourcePlugin: this.PLUGIN_NAME,
                        externalId,
                        customerName,
                        customerEmail: addr.email || `trendyol-${pkg.id}@placeholder.ty`,
                        customerPhone: addr.fullAddress ? undefined : addr.phone,
                    });
                    console.log(`[Trendyol] Saved order TY-${pkg.orderNumber || pkg.id} (${total.toFixed(2)})`);
                } catch (err) {
                    console.error(`[Trendyol] Failed to save order ${pkg.id}:`, err.message);
                }
            }

            page++;
        }
    }

    /**
     * Updates stock (and optionally price) for a Core product on Trendyol.
     *
     * Docs: PUT /product/sellers/{sellerId}/products/price-and-inventory
     * Body: { items: [{ barcode, quantity, salePrice, listPrice }] }
     *
     * Uses ExternalProductMapping to resolve Core productId → Trendyol barcode.
     */
    async updateStock(productId, newStock) {
        if (!this.config.sellerId || !this.config.apiKey || !this.config.apiSecret) {
            return false;
        }

        const mapping = await this.ctx.mapping.get(productId, this.PLUGIN_NAME);
        if (!mapping) {
            // Product not listed on Trendyol — nothing to sync
            return true;
        }

        // externalId contains the barcode (EAN) of the product as listed on Trendyol
        const barcode = mapping.externalId;

        let data;
        try {
            data = await this._put(`/product/sellers/${this.config.sellerId}/products/price-and-inventory`, {
                items: [{
                    barcode,
                    quantity: newStock,
                    // salePrice and listPrice are required by Trendyol — fetch from product if available
                    // If not set in mapping metadata, skip price update (keeps existing price)
                }],
            });
        } catch (err) {
            console.error('[Trendyol] updateStock failed:', err.message);
            return false;
        }

        if (data.failItems && data.failItems.length > 0) {
            console.error('[Trendyol] updateStock failItems:', JSON.stringify(data.failItems));
            return false;
        }

        console.log(`[Trendyol] Stock updated: barcode ${barcode} → ${newStock} units`);
        return true;
    }

    /**
     * Pushes a new product to Trendyol using the V2 Product Create API.
     *
     * Docs: POST /product/sellers/{sellerId}/v2/products
     *
     * Trendyol uses async batch processing:
     * Response: { batchRequestId: "..." }
     * Use GET /product/sellers/{sellerId}/batch-requests/{batchRequestId} to check status.
     *
     * Required fields: barcode, title, productMainId, brandId, categoryId,
     *                  quantity, stockCode, listPrice, salePrice, vatRate,
     *                  images, attributes
     */
    async pushProduct(productId, productData) {
        if (!this.config.sellerId || !this.config.apiKey || !this.config.apiSecret) {
            console.error('[Trendyol] Cannot push product: credentials not set');
            return false;
        }

        // barcode is mandatory and must be unique. Use SKU as barcode.
        const barcode = productData.sku || productId;

        const payload = {
            items: [{
                barcode,
                title: productData.name,
                productMainId: productData.sku,
                brandId: productData.trendyolBrandId || 0,     // Must be a valid Trendyol brand ID
                categoryId: productData.trendyolCategoryId || 0,  // Leaf category ID (subCategories: [])
                quantity: productData.stock || 0,
                stockCode: productData.sku,
                listPrice: productData.listPrice || productData.price,
                salePrice: productData.price,
                vatRate: 19,  // 19% VAT — Romania standard
                cargoCompanyId: 10, // Default cargo company ID
                description: productData.description || productData.name,
                images: (productData.images || []).map(url => ({ url })),
                attributes: productData.trendyolAttributes || [],
            }],
        };

        let data;
        try {
            data = await this._post(`/product/sellers/${this.config.sellerId}/v2/products`, payload);
        } catch (err) {
            console.error('[Trendyol] pushProduct failed:', err.message);
            return false;
        }

        if (!data.batchRequestId) {
            console.error('[Trendyol] pushProduct: no batchRequestId in response', data);
            return false;
        }

        // Save the mapping — barcode is the stable external identifier
        await this.ctx.mapping.save({
            productId,
            pluginName: this.PLUGIN_NAME,
            externalId: barcode,
            externalCategory: String(productData.trendyolCategoryId || ''),
        });

        console.log(`[Trendyol] Product queued: batchRequestId=${data.batchRequestId}`);
        return true;
    }

    /**
     * Called when a Core order status changes.
     * Trendyol uses package status updates rather than order-level status.
     * See: PUT /order/sellers/{sellerId}/shipping-packages/{cargoTrackingNumber}/status
     */
    async onOrderUpdated(orderId, newStatus) {
        console.log(`[Trendyol] Core order ${orderId} → status: ${newStatus}`);
        // In production: query DB for externalId (packageId), then update package status
        // via PUT /order/sellers/{sellerId}/shipping-packages/{cargoTrackingNumber}/status
    }
}

module.exports = { default: TrendyolConnector };
