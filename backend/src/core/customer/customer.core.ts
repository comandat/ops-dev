import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContextService } from '../../tenant/tenant-context.service';

export interface CreateOrUpdateCustomerInput {
    email: string;
    name: string;
    phone?: string;
    address?: string;
}

@Injectable()
export class CustomerCore {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
    ) { }

    private get tenantId(): string {
        return this.tenantContext.getTenantId();
    }

    async findOrCreate(input: CreateOrUpdateCustomerInput) {
        return this.prisma.customer.upsert({
            where: {
                tenantId_email: {
                    tenantId: this.tenantId,
                    email: input.email,
                },
            },
            update: {
                name: input.name,
                phone: input.phone,
                address: input.address,
            },
            create: {
                tenantId: this.tenantId,
                email: input.email,
                name: input.name,
                phone: input.phone,
                address: input.address,
            },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.customer.findUnique({
            where: {
                tenantId_email: {
                    tenantId: this.tenantId,
                    email,
                },
            },
        });
    }

    async findAll() {
        return this.prisma.customer.findMany({
            where: { tenantId: this.tenantId },
        });
    }
}
