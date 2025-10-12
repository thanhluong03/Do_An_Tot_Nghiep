import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActorChangeStatusOrderEntity } from '../entities/actor_change_status_order.entity';

@Injectable()
export class ActorChangeStatusOrderRepository {
    constructor(
        @InjectRepository(ActorChangeStatusOrderEntity)
        private readonly actorChangeStatusOrderRepository: Repository<ActorChangeStatusOrderEntity>,
    ) { }

    async findOrCreateActor(
        user_id?: number,
        customer_id?: number,
        actor_type?: string,
    ): Promise<ActorChangeStatusOrderEntity> {
        let actorChange = await this.actorChangeStatusOrderRepository.findOne({
            where: {
                user_id,
                customer_id,
                actor_type,
            },
        });
        if (!actorChange) {
            actorChange = this.actorChangeStatusOrderRepository.create({
                user_id,
                customer_id,
                actor_type,
            });
            actorChange = await this.actorChangeStatusOrderRepository.save(actorChange);
        }
        return actorChange;
    }


    async findById(id: number): Promise<ActorChangeStatusOrderEntity | null> {
        return this.actorChangeStatusOrderRepository.findOne({ where: { id } });
    }
}
