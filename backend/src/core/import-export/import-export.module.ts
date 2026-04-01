import { Module } from '@nestjs/common';
import { ImportExportService } from './import-export.service';
import { ImportExportController } from './import-export.controller';
import { TenantModule } from '../../tenant/tenant.module';
import { EasysalesImportService } from './easysales-import.service';

@Module({
    imports: [TenantModule],
    providers: [ImportExportService, EasysalesImportService],
    controllers: [ImportExportController],
})
export class ImportExportModule { }
