import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as xlsx from 'xlsx';

@Injectable()
export class EasysalesImportService {
    private readonly logger = new Logger(EasysalesImportService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Processes the EasySales migration files (Products + Offers).
     */
    async processMigration(
        tenantId: string,
        productsFile: Express.Multer.File,
        offersFiles: Express.Multer.File[],
    ) {
        this.logger.log(`Starting EasySales migration for tenant ${tenantId}`);

        // 1. Parse Products
        const productsData = this.parseExcel(productsFile.buffer);
        this.logger.log(`Found ${productsData.length} products in export.`);

        // 2. Parse Offers
        const allOffersData: any[] = [];
        if (offersFiles && offersFiles.length > 0) {
            for (const file of offersFiles) {
                const offersData = this.parseExcel(file.buffer);
                allOffersData.push(...offersData);
                this.logger.log(`Found ${offersData.length} offers in file ${file.originalname}`);
            }
        }

        // 3. Map Data
        const { productsToInsert, offersToInsert } = this.mapEasysalesData(
            tenantId,
            productsData,
            allOffersData,
        );

        // 4. Batch Insert (optimized for SQLite without transactions)
        this.logger.log(`Syncing ${productsToInsert.length} products...`);

        // 4.1. Get existing SKUs to avoid duplicates (SQLite createMany doesn't support skipDuplicates)
        const existingProducts = await this.prisma.product.findMany({
            where: { tenantId },
            select: { id: true, sku: true, attributes: true }
        });
        const existingSkus = new Set(existingProducts.map(p => p.sku));

        // 4.2. Filter out products that already exist
        const newProducts = productsToInsert.filter(p => !existingSkus.has(p.sku));

        if (newProducts.length > 0) {
            this.logger.log(`Inserting ${newProducts.length} NEW products...`);
            await this.prisma.product.createMany({
                data: newProducts,
            });
        } else {
            this.logger.log(`No new products to insert.`);
        }

        // 4.3. Re-fetch products (new and old) to map IDs to offers
        const allDbProducts = await this.prisma.product.findMany({
            where: { tenantId },
            select: { id: true, sku: true, attributes: true },
        });

        const productMap = new Map();
        for (const p of allDbProducts) {
            productMap.set(p.sku, p.id);
            if ((p as any).attributes) {
                try {
                    const attr = JSON.parse((p as any).attributes);
                    const ean = attr['EAN'] || attr['ean'];
                    if (ean) productMap.set(ean.toString(), p.id);
                } catch (e) { }
            }
        }

        // 4.4. Map offers to their respective productIds
        const validOffersToInsert = [];
        for (const o of offersToInsert) {
            const matchKey = (o as any)._tempMatchKey;
            const productId = productMap.get(matchKey);
            if (productId) {
                const { _tempMatchKey, ...offerData } = o as any;
                validOffersToInsert.push({
                    ...offerData,
                    productId,
                });
            }
        }

        // 4.5. Get existing offers to avoid duplicates
        const existingOffersAtDb = await this.prisma.productOffer.findMany({
            where: { tenantId },
            select: { productId: true, pluginName: true }
        });
        const offerKeySet = new Set(existingOffersAtDb.map(o => `${o.productId}_${o.pluginName}`));

        // 4.6. Filter out offers that already exist in DB AND deduplicate in current batch
        const uniqueOffersInBatch = new Map();
        for (const o of validOffersToInsert) {
            const key = `${o.productId}_${o.pluginName}`;
            if (!offerKeySet.has(key) && !uniqueOffersInBatch.has(key)) {
                uniqueOffersInBatch.set(key, o);
            }
        }
        const newOffers = Array.from(uniqueOffersInBatch.values());

        this.logger.log(`Syncing ${newOffers.length} valid offers...`);
        if (newOffers.length > 0) {
            await this.prisma.productOffer.createMany({
                data: newOffers,
            });
        }

        this.logger.log(`EasySales migration completed for tenant ${tenantId}`);
        return {
            success: true,
            productsProcessed: productsToInsert.length,
            offersProcessed: newOffers.length,
        };
    }

    private parseExcel(buffer: Buffer): any[] {
        const wb = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        return xlsx.utils.sheet_to_json(sheet);
    }

    private mapEasysalesData(tenantId: string, productsRaw: any[], offersRaw: any[]) {
        const productsToInsert = [];
        const offersToInsert = [];

        // --- MAP PRODUCTS ---
        for (const row of productsRaw) {
            const sku = row['SKU']?.toString() || `UNKNOWN-${Date.now()}-${Math.random()}`;
            const name = row['Nume'] || 'Unnamed Product';
            const description = row['Descriere'] || null;

            const priceStr = row['Preț redus'] || row['Preț redus cu TVA'] || '0';
            const price = parseFloat(priceStr.toString().replace(/,/g, '')) || 0;

            const originalPriceStr = row['Preț întreg'] || row['Preț întreg cu TVA'] || priceStr;
            const originalPrice = parseFloat(originalPriceStr.toString().replace(/,/g, '')) || null;

            const imagesRaw = row['Imagini'];
            let images = null;
            if (imagesRaw && typeof imagesRaw === 'string') {
                images = JSON.stringify(imagesRaw.split(',').map(u => u.trim()).filter(u => u));
            }

            // Consolidate attributes
            const attributesObj: any = {};
            for (const key of Object.keys(row)) {
                if (!['SKU', 'Nume', 'Descriere', 'Preț redus', 'Preț redus cu TVA', 'Preț întreg', 'Preț întreg cu TVA', 'Imagini'].includes(key)) {
                    // If it's a Prod ch. X name/val pair, map them elegantly
                    if (key.match(/^Prod ch\. \d+ name$/)) {
                        const valKey = key.replace('name', 'val.');
                        if (row[valKey]) {
                            attributesObj[row[key]] = row[valKey];
                        }
                    } else if (!key.match(/^Prod ch\. \d+ val\.$/)) {
                        // Normal unstructured column (Brand, EAN, Culoare, etc)
                        attributesObj[key] = row[key];
                    }
                }
            }

            productsToInsert.push({
                tenantId,
                sku,
                name,
                description,
                price,
                originalPrice,
                stock: 0, // EasySales export structure usually has separate stocks, default to 0 for now unless provided
                images,
                attributes: JSON.stringify(attributesObj),
            });
        }

        // --- MAP OFFERS ---
        for (const row of offersRaw) {
            // Determine Platform
            let pluginName = '';
            let externalId = '';
            let matchKey = ''; // The EAN or SKU to match against the parsed products

            const ean = row['EAN']?.toString();
            const codPnk = row['Codul PNK din eMAG']?.toString();
            const idVariatie = row['ID Variație']?.toString();
            const idIntern = row['ID intern ofertă']?.toString();
            const idOferta = row['ID ofertă']?.toString();

            if (codPnk) {
                pluginName = 'emag-connector';
                externalId = codPnk;
                matchKey = ean; // eMAG usually links by EAN
            } else if (idVariatie || row['Magazin virtual']?.toString().toLowerCase().includes('trendyol')) {
                pluginName = 'trendyol-connector';
                externalId = idVariatie || idIntern;
                matchKey = idOferta; // In Trendyol export ID Oferta looks like EAN/Barcode 
                if (!matchKey) matchKey = row['EAN']?.toString() || row['SKU']?.toString();
            }

            if (!pluginName || !matchKey) {
                continue; // Unrecognized offer format or missing match key
            }

            const priceStr = row['Preț redus'] || '0';
            const price = parseFloat(priceStr.toString().replace(/,/g, '')) || 0;

            const originalPriceStr = row['Preț întreg'] || priceStr;
            const originalPrice = parseFloat(originalPriceStr.toString().replace(/,/g, '')) || null;

            // Consolidate attributes
            const attributesObj: any = {};
            for (const key of Object.keys(row)) {
                if (!['Preț redus', 'Preț întreg', 'EAN', 'Codul PNK din eMAG', 'ID Variație', 'ID intern ofertă'].includes(key)) {
                    if (key.match(/^Offer ch\. \d+ name$/)) {
                        const valKey = key.replace('name', 'val.');
                        if (row[valKey]) {
                            attributesObj[row[key]] = row[valKey];
                        }
                    } else if (!key.match(/^Offer ch\. \d+ val\.$/)) {
                        attributesObj[key] = row[key];
                    }
                }
            }

            offersToInsert.push({
                tenantId,
                pluginName,
                externalId,
                externalCategory: row['Categorie']?.toString() || null,
                price,
                originalPrice,
                status: 'SYNCED',
                isLinked: true,
                attributes: JSON.stringify(attributesObj),
                _tempMatchKey: matchKey, // temporarily store to map to productId later
            });
        }

        return { productsToInsert, offersToInsert };
    }
}
