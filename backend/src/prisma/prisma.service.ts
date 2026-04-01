import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        console.log('PrismaService: DATABASE_URL =', process.env.DATABASE_URL);
        super({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        } as any);
    }

    async onModuleInit() {
        await this.$connect();
    }
}
