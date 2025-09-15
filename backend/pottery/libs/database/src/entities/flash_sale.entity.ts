import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('flash_sales')
export class FlashSaleEntity extends BaseEntity {
    @Column({ type: 'varchar', nullable: false })
    name: string;

    @Column({ type: 'time', nullable: true })
    start_time: string;

    @Column({ type: 'time', nullable: true })
    end_time: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    effective_period_begins: Date;

    @Column({ type: 'timestamptz', nullable: true })
    effective_period_ends: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    flash_sale_price: number;

    @Column({ type: 'integer', default: 0, nullable: false })
    quantity: number;
}