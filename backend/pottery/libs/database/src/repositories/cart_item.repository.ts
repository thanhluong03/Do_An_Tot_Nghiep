import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { CartItemEntity } from '../entities/cart_item.entity'

@Injectable()
export class CartItemRepository {
    constructor(
        @InjectRepository(CartItemEntity)
        private readonly repository: Repository<CartItemEntity>,
    ) { }

    async create(data: Partial<CartItemEntity>): Promise<CartItemEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<CartItemEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findByCustomer(customer_id: number): Promise<CartItemEntity | null> {
        return this.repository.findOne({
            where: { customer_id: customer_id, deleted_at: IsNull() },
        })
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<CartItemEntity[]> {
        return this.repository.find({
            where: { deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        })
    }

    async findAllByCustomer(customer_id: number): Promise<CartItemEntity[]> {
        return this.repository.find({
            where: { customer_id: customer_id, deleted_at: IsNull() },
            order: { created_at: 'DESC' },
        });
    }

    async update(id: number, data: Partial<CartItemEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}