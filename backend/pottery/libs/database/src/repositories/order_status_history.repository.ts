import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatusHistoryEntity, OrderStatusHistory } from '../entities/order_status_history.entity';

@Injectable()
export class OrderStatusHistoryRepository {
    constructor(
        @InjectRepository(OrderStatusHistoryEntity)
        private readonly orderStatusHistoryRepository: Repository<OrderStatusHistoryEntity>,
    ) { }

    async logStatusChange(order_id: number, status: OrderStatusHistory, user_id?: number, customer_id?: number): Promise<void> {
        const history: Partial<OrderStatusHistoryEntity> = {
            order_id,
            status,
            ...(user_id ? { user_id } : customer_id ? { customer_id } : {}),
        };
        const entity = this.orderStatusHistoryRepository.create(history);
        await this.orderStatusHistoryRepository.save(entity);
    }

    async getHistoryByOrderId(order_id: number): Promise<OrderStatusHistoryEntity[]> {
        return this.orderStatusHistoryRepository.find({
            where: { order_id },
            order: { created_at: 'DESC' },
        });
    }
}
