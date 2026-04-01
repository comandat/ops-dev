import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";

// Defer Prisma instantiation to prevent testing frameworks from crashing
// on module import if environment variables aren't loaded yet.
let adapter: PrismaAdapter<PrismaClient>;
export function getLuciaAdapter() {
    if (!adapter) {
        const client = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        } as any);
        adapter = new PrismaAdapter(client.session, client.user);
    }
    return adapter;
}

let _lucia: Lucia;
export function getLucia() {
    if (!_lucia) {
        _lucia = new Lucia(getLuciaAdapter(), {
            sessionCookie: {
                attributes: {
                    secure: process.env.NODE_ENV === "production"
                }
            },
            getUserAttributes: (attributes) => {
                return {
                    email: attributes.email,
                    name: attributes.name,
                    role: attributes.role,
                    tenantId: attributes.tenantId
                };
            }
        });
    }
    return _lucia;
}


declare module "lucia" {
    interface Register {
        Lucia: ReturnType<typeof getLucia>;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    email: string;
    name: string | null;
    role: string;
    tenantId: string;
}
