import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContextService } from '../../tenant/tenant-context.service';

// ─── Domain Types ────────────────────────────────────────────────────────────

export interface ProductImportResult {
    created: number;
    updated: number;
    errors: string[];
}

interface ProductCsvRow {
    sku: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    lowStockThreshold: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PRODUCT_CSV_HEADERS = ['id', 'sku', 'name', 'description', 'price', 'stock', 'lowStockThreshold'];
const ORDER_CSV_HEADERS = ['orderNumber', 'status', 'total', 'sourcePlugin', 'customerName', 'customerEmail', 'createdAt'];
const DEFAULT_STOCK = 0;
const DEFAULT_LOW_STOCK_THRESHOLD = 10;

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class ImportExportService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
    ) { }

    private get tenantId(): string {
        return this.tenantContext.getTenantId();
    }

    // ─── Export ──────────────────────────────────────────────────────────────

    async exportProducts(): Promise<string> {
        const products = await this.prisma.product.findMany({
            where: { tenantId: this.tenantId },
            orderBy: { createdAt: 'asc' },
        });

        const rows = products.map(p => [
            p.id,
            p.sku,
            p.name,
            p.description ?? '',
            String(p.price),
            String(p.stock),
            String(p.lowStockThreshold),
        ]);

        return serializeToCsv(PRODUCT_CSV_HEADERS, rows);
    }

    async exportOrders(): Promise<string> {
        const orders = await this.prisma.order.findMany({
            where: { tenantId: this.tenantId },
            include: { customer: true, items: true },
            orderBy: { createdAt: 'desc' },
        });

        const rows = orders.map(o => [
            o.orderNumber,
            o.status,
            String(o.total),
            o.sourcePlugin ?? '',
            o.customer?.name ?? '',
            o.customer?.email ?? '',
            o.createdAt.toISOString(),
        ]);

        return serializeToCsv(ORDER_CSV_HEADERS, rows);
    }

    // ─── Import ──────────────────────────────────────────────────────────────

    async importProducts(csvContent: string): Promise<ProductImportResult> {
        const rawRows = parseCsv(csvContent);
        if (!rawRows.length) {
            throw new BadRequestException('CSV file is empty or has no data rows');
        }

        const result: ProductImportResult = { created: 0, updated: 0, errors: [] };

        for (const rawRow of rawRows) {
            const validation = validateProductCsvRow(rawRow);
            if (!validation.isValid) {
                result.errors.push(validation.error!);
                continue;
            }
            const row = validation.row!;
            await this.upsertProduct(row, result);
        }

        return result;
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private async upsertProduct(row: ProductCsvRow, result: ProductImportResult) {
        const existing = await this.prisma.product.findFirst({
            where: { sku: row.sku, tenantId: this.tenantId },
            select: { id: true },
        });

        const productData = {
            name: row.name,
            description: row.description ?? null,
            price: row.price,
            stock: row.stock,
            lowStockThreshold: row.lowStockThreshold,
        };

        if (existing) {
            await this.prisma.product.updateMany({
                where: { id: existing.id, tenantId: this.tenantId },
                data: productData,
            });
            result.updated++;
        } else {
            await this.prisma.product.create({
                data: { tenantId: this.tenantId, sku: row.sku, ...productData },
            });
            result.created++;
        }
    }
}

// ─── Pure Utility Functions ──────────────────────────────────────────────────
// Kept as module-level functions (not class methods) because they have
// zero dependency on class state and are easier to unit-test in isolation.

function serializeToCsv(headers: string[], rows: string[][]): string {
    const escapeCsvCell = (value: string): string =>
        `"${(value ?? '').toString().replace(/"/g, '""')}"`;

    const lines = [headers, ...rows].map(row =>
        row.map(escapeCsvCell).join(','),
    );
    return lines.join('\r\n');
}

/**
 * RFC-4180-compliant CSV parser.
 * Handles quoted fields that may contain commas and escaped double-quotes.
 */
function parseCsv(csv: string): Record<string, string>[] {
    const lines = tokenizeCsvLines(csv);
    if (lines.length < 2) return [];

    const headers = lines[0];
    return lines.slice(1).map(values => {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            row[header] = values[index] ?? '';
        });
        return row;
    });
}

/**
 * Tokenizes a CSV string into a 2-D array of string values.
 * Correctly handles commas inside double-quoted fields.
 */
function tokenizeCsvLines(csv: string): string[][] {
    const result: string[][] = [];
    const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);

    for (const line of lines) {
        const fields: string[] = [];
        let currentField = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"' && insideQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                fields.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }
        fields.push(currentField.trim());
        result.push(fields);
    }

    return result;
}

function validateProductCsvRow(raw: Record<string, string>): {
    isValid: boolean;
    row?: ProductCsvRow;
    error?: string;
} {
    const sku = raw['sku']?.trim();
    const name = raw['name']?.trim();

    if (!sku || !name) {
        return {
            isValid: false,
            error: `Row skipped — missing required field(s) 'sku' or 'name': ${JSON.stringify(raw)}`,
        };
    }

    return {
        isValid: true,
        row: {
            sku,
            name,
            description: raw['description']?.trim() || undefined,
            price: parseFloat(raw['price'] || '0'),
            stock: parseInt(raw['stock'] || String(DEFAULT_STOCK), 10),
            lowStockThreshold: parseInt(raw['lowStockThreshold'] || String(DEFAULT_LOW_STOCK_THRESHOLD), 10),
        },
    };
}
