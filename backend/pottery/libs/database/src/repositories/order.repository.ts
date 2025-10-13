import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order_item.entity';

@Injectable()
export class OrderRepository {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,
        @InjectRepository(OrderItemEntity)
        private readonly orderItemRepository: Repository<OrderItemEntity>,
    ) { }
    async save(order: Partial<OrderEntity>): Promise<OrderEntity> {
        return await this.orderRepository.save(order);
    }
    async createOrder(
        data: Partial<OrderEntity>,
        items: Partial<OrderItemEntity>[],
    ): Promise<OrderEntity> {
        const order = this.orderRepository.create(data);
        const savedOrder = await this.orderRepository.save(order);
        for (const item of items) {
            await this.orderItemRepository.save(
                this.orderItemRepository.create({ ...item, order_id: savedOrder.id }),
            );
        }
        return savedOrder;
    }

    async findById(id: number): Promise<OrderEntity | null> {
        return this.orderRepository.findOne({
            where: { id, deleted_at: IsNull() },
        });
    }

    async findAll(params: {
        size: number;
        page: number;
        key?: string;
        customer_id?: number;
    }): Promise<OrderEntity[]> {
        const where: any = { deleted_at: IsNull() };
        if (params.customer_id !== undefined) {
            where.customer_id = params.customer_id;
        }
        const [result] = await this.orderRepository.findAndCount({
            where,
            order: { created_at: 'DESC' },
            skip: (params.page - 1) * params.size,
            take: params.size,
        });
        return Array.isArray(result) ? result : [];
    }

    async update(id: number, data: Partial<OrderEntity>): Promise<void> {
        await this.orderRepository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.orderRepository.softDelete(id);
    }
}
