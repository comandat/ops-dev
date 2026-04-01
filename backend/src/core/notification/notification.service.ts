import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
    constructor(private readonly gateway: NotificationGateway) { }

    /**
     * Broadcasts a success notification
     */
    success(tenantId: string, message: string, title = 'Succes') {
        this.gateway.sendToTenant(tenantId, 'notification', {
            type: 'success',
            title,
            message,
            timestamp: new Date(),
        });
    }

    /**
     * Broadcasts an error notification
     */
    error(tenantId: string, message: string, title = 'Eroare') {
        this.gateway.sendToTenant(tenantId, 'notification', {
            type: 'error',
            title,
            message,
            timestamp: new Date(),
        });
    }

    /**
     * Broadcasts a generic info notification
     */
    info(tenantId: string, message: string, title = 'Info') {
        this.gateway.sendToTenant(tenantId, 'notification', {
            type: 'info',
            title,
            message,
            timestamp: new Date(),
        });
    }
}
