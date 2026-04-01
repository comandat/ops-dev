"use strict";

const crypto = require('crypto');

/**
 * FGO Connector Plugin for OpenSales
 *
 * Fully functional implementation of the IPlugin interface for FGO Invoicing.
 * API Reference: FGO API v7.1
 * Base URL: https://api.fgo.ro/v1
 *
 * Authentication: Hash-based (SHA-1)
 * Config fields: { codUnic, cheiePrivata, platformaUrl }
 */

class FgoConnector {
    constructor() {
        this.manifest = {
            name: 'fgo-connector',
            version: '1.0.0',
            author: 'OpenSales Team',
            description: 'Conectare cu FGO pentru emiterea automată a facturilor.',
            capabilities: ['onOrderUpdated'], // Listens for order status changes to emit invoice
            configFields: [
                { key: 'codUnic', label: 'CUI Firma', type: 'string', required: true },
                { key: 'cheiePrivata', label: 'Cheie Privată FGO', type: 'password', required: true },
                { key: 'platformaUrl', label: 'Adresa site-ului (ex: https://magazin.ro)', type: 'string', required: true },
                { key: 'useStage', label: 'Mediu TEST', type: 'boolean', required: false },
            ],
        };

        this.config = {};
        this.ctx = null;
        this.PLUGIN_NAME = 'fgo-connector';
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    _baseUrl() {
        const stage = this.config.useStage === 'true' || this.config.useStage === true;
        return stage ? 'https://api-testuat.fgo.ro/v1' : 'https://api.fgo.ro/v1';
    }

    /**
     * Calculates the SHA-1 Hash required by FGO.
     * For "Emitere Factura": Hash = SHA-1(CodUnic + CheiePrivata + Denumire Client)
     * For "Anulare/Stornare/Print": Hash = SHA-1(CodUnic + CheiePrivata + NumarFactura)
     */
    _calculateHash(dynamicPart) {
        const { codUnic, cheiePrivata } = this.config;
        const raw = `${codUnic}${cheiePrivata}${dynamicPart}`;
        return crypto.createHash('sha1').update(raw).digest('hex').toUpperCase();
    }

    async _post(resource, payload) {
        const url = `${this._baseUrl()}/${resource}`;

        // Convert payload object to URL-encoded form data as FGO often expects x-www-form-urlencoded
        const formData = new URLSearchParams();
        for (const [key, value] of Object.entries(payload)) {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        }

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        });

        if (!resp.ok) {
            throw new Error(`FGO API error ${resp.status} on ${resource}`);
        }
        return resp.json();
    }

    // ─── IPlugin Implementation ───────────────────────────────────────────────

    async onLoad(config, ctx) {
        this.config = config;
        this.ctx = ctx;
        console.log(`[FGO] Loaded. CodUnic: ${config.codUnic || 'NOT SET'}`);
    }

    /**
     * Hook triggered when an order is updated in Core.
     * If the order status is changed to SHIPPED or DELIVERED, we issue an invoice via FGO.
     */
    async onOrderUpdated(orderId, newStatus) {
        if (!['SHIPPED', 'DELIVERED'].includes(newStatus?.toUpperCase())) {
            return; // Only bill when the order is fulfilled
        }

        if (!this.config.codUnic || !this.config.cheiePrivata) {
            console.warn(`[FGO] Cannot issue invoice for order ${orderId}: credentials not configured`);
            return;
        }

        console.log(`[FGO] Processing invoice emission for order ${orderId} (Status: ${newStatus})`);

        try {
            // 1. Fetch deep order details from Core
            const order = await this.ctx.order.getById(orderId);
            if (!order) {
                console.error(`[FGO] Order ${orderId} not found in Core.`);
                return;
            }

            // Check if we already invoiced it (custom logic using metadata/tagging could be added)
            // For now, FGO has VerificareDuplicat logic via IdExtern

            const clientName = order.customerName || 'Client PF';
            const hash = this._calculateHash(clientName);

            // 2. Build the Payload
            const payload = {
                CodUnic: this.config.codUnic,
                Hash: hash,
                TipFactura: 'Factura',
                Valuta: 'RON',
                PlatformaUrl: this.config.platformaUrl || 'https://opensales.local',
                VerificareDuplicat: 'true',
                IdExtern: order.id, // Ensure we don't emit multiple invoices for the same Core Order ID

                // Client Info
                'Client[Denumire]': clientName,
                'Client[Tara]': 'RO', // Assuming default RO for now, could be dynamic
                'Client[Tip]': 'PF',
            };

            if (order.customerEmail) {
                payload['Client[Email]'] = order.customerEmail;
            }

            // 3. Attach Items
            if (order.items && order.items.length > 0) {
                order.items.forEach((item, index) => {
                    payload[`Continut[${index}][Denumire]`] = item.productName;
                    payload[`Continut[${index}][UM]`] = 'buc';
                    payload[`Continut[${index}][NrProduse]`] = item.quantity;
                    payload[`Continut[${index}][PretUnitar]`] = item.unitPrice;
                    payload[`Continut[${index}][CotaTVA]`] = 19; // Defaulting to 19% VAT
                });
            } else {
                // Fallback if no items
                payload['Continut[0][Denumire]'] = 'Contravaloare comanda';
                payload['Continut[0][UM]'] = 'buc';
                payload['Continut[0][NrProduse]'] = 1;
                payload['Continut[0][PretUnitar]'] = order.total;
                payload['Continut[0][CotaTVA]'] = 19;
            }

            // 4. Send request to FGO
            const response = await this._post('factura/emitere', payload);

            if (response && response.Success) {
                console.log(`[FGO] Successfully emitted invoice ${response.Factura?.Serie} ${response.Factura?.Numar} for order ${order.orderNumber}`);
                // Optional: We could save the invoice link/number back to the order notes or a dedicated table
                const invoiceNote = `Factura emisa: ${response.Factura?.Serie} ${response.Factura?.Numar}`;
                try {
                    // Requires context support for adding notes
                    // await this.ctx.order.addNote(order.id, invoiceNote);
                } catch (e) {
                    // Ignore note errors
                }
            } else {
                console.error(`[FGO] Failed to emit invoice for order ${order.orderNumber}:`, response?.Message || 'Unknown error');
            }

        } catch (error) {
            console.error(`[FGO] Error during invoice emission for order ${orderId}:`, error.message);
        }
    }
}

module.exports = { default: FgoConnector };
