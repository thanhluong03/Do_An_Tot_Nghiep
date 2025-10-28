import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable, Inject } from '@nestjs/common';
import { DriverLocationService } from '@app/driver_location';
import { OrderRepository } from '@app/database';
import { OrderStatus } from '@app/database/entities';

export interface TrackingLocation {
  order_id: number;
  driver_id: number;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

@WebSocketGateway({
  namespace: '/tracking',
  cors: {
    origin: process.env.WS_ALLOW_ORIGINS?.split(',') || '*',
    credentials: true,
  },
})
@Injectable()
export class TrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('TrackingGateway');
  private activeDrivers = new Map<number, Socket>(); // driver_id -> socket
  private activeCustomers = new Map<number, Set<Socket>>(); // order_id -> Set<Socket>
  private activeAdmins = new Set<Socket>();

  constructor(
    private readonly driverLocationService: DriverLocationService,
    @Inject(OrderRepository)
    private readonly orderRepository: OrderRepository,
  ) {}

  afterInit() {
    this.logger.log('Tracking WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove from active drivers
    for (const [driverId, socket] of this.activeDrivers.entries()) {
      if (socket.id === client.id) {
        this.activeDrivers.delete(driverId);
        break;
      }
    }

    // Remove from active customers
    for (const [orderId, sockets] of this.activeCustomers.entries()) {
      sockets.delete(client);
      if (sockets.size === 0) {
        this.activeCustomers.delete(orderId);
      }
    }

    // Remove from active admins
    this.activeAdmins.delete(client);
  }

  /**
   * Driver joins tracking room for their assigned orders
   */
  @SubscribeMessage('driver_join')
  async handleDriverJoin(
    @MessageBody() data: { driver_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.driver_id) {
      return { error: 'driver_id is required' };
    }

    this.activeDrivers.set(data.driver_id, client);
    this.logger.log(`Driver ${data.driver_id} joined tracking`);
    
    return { success: true, message: 'Joined tracking room' };
  }

  /**
   * Customer joins tracking room for their order
   */
  @SubscribeMessage('customer_join')
  async handleCustomerJoin(
    @MessageBody() data: { order_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.order_id) {
      return { error: 'order_id is required' };
    }

    const order = await this.orderRepository.findById(data.order_id);
    if (!order) {
      return { error: 'Order not found' };
    }

    let customerSockets = this.activeCustomers.get(data.order_id);
    if (!customerSockets) {
      customerSockets = new Set();
      this.activeCustomers.set(data.order_id, customerSockets);
    }
    customerSockets.add(client);

    this.logger.log(`Customer joined tracking for order ${data.order_id}`);
    
    return { success: true, message: 'Joined order tracking room' };
  }

  /**
   * Admin joins admin tracking room
   */
  @SubscribeMessage('admin_join')
  async handleAdminJoin(@ConnectedSocket() client: Socket) {
    this.activeAdmins.add(client);
    this.logger.log(`Admin joined tracking`);
    
    return { success: true, message: 'Joined admin tracking room' };
  }

  /**
   * Driver sends location update
   */
  @SubscribeMessage('driver_location_update')
  async handleDriverLocationUpdate(
    @MessageBody() data: {
      driver_id: number;
      order_id: number;
      latitude: number;
      longitude: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.driver_id || !data?.order_id || !data?.latitude || !data?.longitude) {
      return { error: 'Missing required fields' };
    }

    try {
      // Update location in database
      await this.driverLocationService.updateLocation({
        order_id: data.order_id,
        driver_id: data.driver_id,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      const trackingData: TrackingLocation = {
        order_id: data.order_id,
        driver_id: data.driver_id,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date(),
      };

      // Emit to customers tracking this order
      const customerSockets = this.activeCustomers.get(data.order_id);
      if (customerSockets) {
        customerSockets.forEach((socket) => {
          socket.emit('location_update', trackingData);
        });
      }

      // Emit to admins
      this.activeAdmins.forEach((socket) => {
        socket.emit('location_update', trackingData);
      });

      this.logger.log(
        `Location updated for order ${data.order_id} by driver ${data.driver_id}`,
      );

      return { success: true, data: trackingData };
    } catch (error) {
      this.logger.error('Error updating driver location:', error);
      return { error: 'Failed to update location' };
    }
  }

  /**
   * Accept order and start tracking
   */
  @SubscribeMessage('driver_accept_order')
  async handleDriverAcceptOrder(
    @MessageBody() data: {
      driver_id: number;
      order_id: number;
      latitude: number;
      longitude: number;
    },
  ) {
    try {
      const result = await this.driverLocationService.acceptOrder({
        order_id: data.order_id,
        driver_id: data.driver_id,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      const order = await this.orderRepository.findById(data.order_id);
      
      // Notify customers
      const customerSockets = this.activeCustomers.get(data.order_id);
      if (customerSockets) {
        const trackingData = {
          order_id: data.order_id,
          driver_id: data.driver_id,
          latitude: data.latitude,
          longitude: data.longitude,
          status: OrderStatus.SHIPPING,
          timestamp: new Date(),
        };
        
        customerSockets.forEach((socket) => {
          socket.emit('order_accepted', trackingData);
        });
      }

      // Notify admins
      this.activeAdmins.forEach((socket) => {
        socket.emit('order_status_changed', {
          order_id: data.order_id,
          status: OrderStatus.SHIPPING,
        });
      });

      return { success: true, result };
    } catch (error) {
      this.logger.error('Error accepting order:', error);
      return { error: 'Failed to accept order' };
    }
  }
}

