import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { DriverLocationEntity, DriverStatus } from '../entities';

@Injectable()
export class DriverLocationRepository {
    constructor(
        @InjectRepository(DriverLocationEntity)
        private readonly repository: Repository<DriverLocationEntity>,
    ) { }

    async create(data: Partial<DriverLocationEntity>): Promise<DriverLocationEntity> {
        return this.repository.save(this.repository.create(data));
    }

    async findById(id: number): Promise<DriverLocationEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        });
    }

    async findByOrderId(order_id: number): Promise<DriverLocationEntity | null> {
        return this.repository.findOne({
            where: { order_id, deleted_at: IsNull() },
        });
    }

    async findByDriverId(driver_id: number): Promise<DriverLocationEntity[]> {
        return this.repository.find({
            where: { driver_id, deleted_at: IsNull() },
            relations: ['order', 'order.customer'],
            order: { created_at: 'DESC' },
        });
    }

    async update(id: number, data: Partial<DriverLocationEntity>): Promise<void> {
        await this.repository.update(id, data);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }

    async findLocationHistory(order_id: number): Promise<DriverLocationEntity[]> {
        return this.repository.find({
            where: { order_id, deleted_at: IsNull() },
            relations: ['user'],
            order: { created_at: 'ASC' },
        });
    }

    async findByOrderIdAndStatus(
        order_id: number,
        driver_status: DriverStatus,
    ): Promise<DriverLocationEntity | null> {
        return this.repository.findOne({
            where: { order_id, driver_status, deleted_at: IsNull() },
        });
    }

    async findByDriverIdWithFilters(
        driver_id: number,
        status?: DriverStatus,
    ): Promise<DriverLocationEntity[]> {
        const query = this.repository
            .createQueryBuilder('dl')
            .leftJoinAndSelect('dl.order', 'order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.orderItems', 'orderItems')
            .leftJoinAndSelect('orderItems.product', 'product')
            .where('dl.driver_id = :driver_id', { driver_id })
            .andWhere('dl.deleted_at IS NULL')
            .orderBy('dl.created_at', 'DESC');

        if (status) {
            query.andWhere('dl.driver_status = :status', { status });
        }

        return query.getMany();
    }

    async findCurrentLocation(order_id: number): Promise<DriverLocationEntity | null> {
        return this.repository.findOne({
            where: { order_id, driver_status: DriverStatus.ACCEPTED, deleted_at: IsNull() },
            relations: ['user'],
            order: { created_at: 'DESC' },
        });
    }
}
