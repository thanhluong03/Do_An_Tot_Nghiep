import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '@app/database';
import { ICreateOrder, IUpdateOrder, IListOrder } from './order.interface';
import { OrderEntity, OrderStatus, PaymentStatus, PaymentMethod } from '@app/database';

@Injectable()
export class OrderService {
    constructor(
        @Inject(OrderRepository)
        private readonly orderRepository: OrderRepository,
    ) { }

    async createOrder(data: ICreateOrder): Promise<OrderEntity> {
        const { items, status, payment_status, payment_method, ...orderData } = data;
        const total_amount = items.reduce((sum, item) => sum + (item.price_at_order * item.quantity), 0);
        const current_order = {
            ...orderData,
            items,
            total_amount,
            status: status ?? OrderStatus.CREATED,
            payment_status: payment_status ?? PaymentStatus.UNPAID,
            payment_method: payment_method ?? PaymentMethod.ONSITE,
            order_date: new Date(),
        };
        return this.orderRepository.createOrder(
            {
                ...orderData,
                total_amount,
                status: status ?? OrderStatus.CREATED,
                payment_status: payment_status ?? PaymentStatus.UNPAID,
                payment_method: payment_method ?? PaymentMethod.ONSITE,
                current_order,
            },
            items
        );
    }

    async getOrderById(id: number): Promise<OrderEntity | null> {
        return this.orderRepository.findById(id);
    }

    async getOrders(params: IListOrder): Promise<OrderEntity[]> {
        return this.orderRepository.findAll(params);
    }

    async updateOrder(id: number, data: IUpdateOrder): Promise<void> {
        const order = await this.orderRepository.findById(id);
        if (!order || (order as any).deleted_at) {
            throw new NotFoundException(`Order with id ${id} not found or has been deleted`);
        }
        const updateData: Partial<OrderEntity> = {};
        if (data.status !== undefined) updateData.status = data.status;
        if (data.payment_status !== undefined) updateData.payment_status = data.payment_status;
        if (data.shipping_address !== undefined) updateData.shipping_address = data.shipping_address;
        if (data.payment_method !== undefined) updateData.payment_method = data.payment_method;
        await this.orderRepository.update(id, updateData);
    }

    async deleteOrder(id: number): Promise<void> {
        await this.orderRepository.softDelete(id);
    }
}
