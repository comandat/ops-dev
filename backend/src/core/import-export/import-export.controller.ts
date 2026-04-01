import { Controller, Get, Post, Res, UploadedFile, UploadedFiles, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ImportExportService } from './import-export.service';
import { EasysalesImportService } from './easysales-import.service';

@UseGuards(JwtAuthGuard)
@Controller('api')
export class ImportExportController {
    constructor(
        private importExportService: ImportExportService,
        private easysalesImportService: EasysalesImportService
    ) { }

    @Get('export/products')
    async exportProducts(@Res() res: Response) {
        const csv = await this.importExportService.exportProducts();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
        res.send(csv);
    }

    @Get('export/orders')
    async exportOrders(@Res() res: Response) {
        const csv = await this.importExportService.exportOrders();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
        res.send(csv);
    }

    @Post('import/products')
    @UseInterceptors(FileInterceptor('file'))
    async importProducts(@UploadedFile() file: Express.Multer.File) {
        const csvContent = file.buffer.toString('utf-8');
        return this.importExportService.importProducts(csvContent);
    }

    @Post('import/easysales')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'products', maxCount: 1 },
        { name: 'offers', maxCount: 10 },
    ], {
        limits: {
            fileSize: 50 * 1024 * 1024, // 50MB
        }
    }))
    async importEasySales(
        @Req() req: any,
        @UploadedFiles() files: { products?: Express.Multer.File[], offers?: Express.Multer.File[] }
    ) {
        console.log(`[ImportExportController] importEasySales request reached controller. Tenant: ${req.user?.tenantId}`);
        if (!files || !files.products) {
            console.error('[ImportExportController] No products file found in request');
            throw new Error('Products export file is required.');
        }

        try {
            return await this.easysalesImportService.processMigration(
                req.user.tenantId,
                files.products[0],
                files.offers || []
            );
        } catch (error) {
            console.error('[ImportExportController] Error during migration:', error);
            throw error;
        }
    }
}
