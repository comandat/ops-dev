import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * A very slim and functional guard to protect Developer API routes using an x-api-key header.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            throw new UnauthorizedException('API Key is missing');
        }

        // In a self-hosted single-tenant setup, we can store the master API key in SystemConfig.
        const config = await this.prisma.systemConfig.findUnique({
            where: { key: 'DEVELOPER_API_KEY' },
        });

        if (!config || config.value !== apiKey) {
            throw new UnauthorizedException('Invalid API Key');
        }

        return true;
    }
}
