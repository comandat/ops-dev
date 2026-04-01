import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getLucia } from './auth.lucia';
import type { Session, User } from 'lucia';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        const lucia = getLucia();
        const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");

        if (!sessionId) {
            req.user = undefined;
            req.session = undefined;
            return next();
        }

        const { session, user } = await lucia.validateSession(sessionId);

        if (session && session.fresh) {
            res.setHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize());
        }
        if (!session) {
            res.setHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
        }

        req.user = user ?? undefined;
        req.session = session ?? undefined;
        next();
    }
}

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            user?: User;
            session?: Session;
        }
    }
}
