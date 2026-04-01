import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // In production, this should be restricted
    },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationGateway.name);

    handleConnection(@ConnectedSocket() client: Socket) {
        const tenantId = client.handshake.query.tenantId as string;
        if (tenantId) {
            client.join(`tenant_${tenantId}`);
            this.logger.log(`Client ${client.id} joined room: tenant_${tenantId}`);
        }
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {
        this.logger.log(`Client ${client.id} disconnected`);
    }

    /**
     * Sends a notification to all users in a specific tenant
     */
    sendToTenant(tenantId: string, event: string, payload: any) {
        this.server.to(`tenant_${tenantId}`).emit(event, payload);
    }
}
