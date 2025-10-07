import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('vouchers')
export class VoucherEntity extends BaseEntity {
    @Column({ type: 'varchar', nullable: false })
    name: string;

    @Column({ type: 'timestamptz', nullable: true })
    start_time: Date;

    @Column({ type: 'timestamptz', nullable: true })
    end_time: Date;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    effective_period_begins: Date;

    @Column({ type: 'timestamptz', nullable: true })
    effective_period_ends: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    voucher_percentage: number;

    @Column({ type: 'integer', default: 0, nullable: false })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    order_conditions: number;
}