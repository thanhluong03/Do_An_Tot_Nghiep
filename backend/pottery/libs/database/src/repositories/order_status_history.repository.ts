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

    async logStatusChange(order_id: number, status: OrderStatusHistory, actorChangeId: number): Promise<void> {
        const history = this.orderStatusHistoryRepository.create({
            order_id,
            status,
            actor_id: actorChangeId,
        });
        await this.orderStatusHistoryRepository.save(history);
    }

    async getHistoryByOrderId(order_id: number): Promise<OrderStatusHistoryEntity[]> {
        return this.orderStatusHistoryRepository.find({
            where: { order_id },
            order: { created_at: 'DESC' },
        });
    }
}
