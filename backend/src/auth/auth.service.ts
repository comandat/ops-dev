import { randomUUID } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getLucia } from './auth.lucia';
import { Scrypt } from 'oslo/password';

export interface RegisterUserInput {
    email: string;
    password: string;
    name: string;
}

export interface ValidatedUser {
    id: string;
    tenantId: string | null;
    email: string;
    name: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class AuthService {
    private readonly scrypt = new Scrypt();

    constructor(private readonly prisma: PrismaService) { }

    async validateUser(email: string, pass: string): Promise<ValidatedUser | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && await this.scrypt.verify(user.password, pass)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async createSession(userId: string) {
        const lucia = getLucia();
        console.log(`[AuthService] createSession for userId: ${userId}`);
        const session = await lucia.createSession(userId, {});
        console.log(`[AuthService] createSession result:`, session);
        const sessionCookie = lucia.createSessionCookie(session?.id);
        return {
            session,
            cookie: sessionCookie,
        };
    }

    async register(input: RegisterUserInput) {
        const { email, password, name } = input;

        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new UnauthorizedException('User already exists');
        }

        const hashedPassword = await this.scrypt.hash(password);
        const tenantId = process.env.OPENSALES_MODE === 'saas'
            ? `tenant_${randomUUID()}`
            : 'default';

        if (process.env.OPENSALES_MODE === 'saas') {
            await this.prisma.tenant.create({
                data: {
                    id: tenantId,
                    name: `${name}'s Workspace`,
                }
            });
        }

        const newUser = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'ADMIN',
                tenantId,
            },
        });

        return this.createSession(newUser.id);
    }

    async logout(sessionId: string) {
        const lucia = getLucia();
        await lucia.invalidateSession(sessionId);
        return lucia.createBlankSessionCookie();
    }
}
