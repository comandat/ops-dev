import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly uploadDir = path.join(process.cwd(), 'uploads');

    constructor() {
        this.ensureUploadDir();
    }

    private async ensureUploadDir() {
        try {
            await fs.access(this.uploadDir);
        } catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
            this.logger.log(`Created upload directory at ${this.uploadDir}`);
        }
    }

    /**
     * Processes an image:
     * 1. Converts to WebP
     * 2. Compresses (quality 80)
     * 3. Resizes if too large (max 1920px width)
     * 4. Returns the public URL/path
     */
    async saveImage(file: Express.Multer.File): Promise<string> {
        const filename = `${uuidv4()}.webp`;
        const filePath = path.join(this.uploadDir, filename);

        await (sharp as any)(file.buffer)
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(filePath);

        return `/uploads/${filename}`;
    }

    async deleteFile(fileUrl: string) {
        if (!fileUrl.startsWith('/uploads/')) return;

        const filename = fileUrl.replace('/uploads/', '');
        const filePath = path.join(this.uploadDir, filename);

        try {
            await fs.unlink(filePath);
        } catch (err) {
            this.logger.error(`Failed to delete file ${filePath}: ${err.message}`);
        }
    }
}
