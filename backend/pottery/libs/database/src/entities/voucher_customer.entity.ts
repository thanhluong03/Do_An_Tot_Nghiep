import { Entity, Column, JoinColumn, ManyToOne, Unique, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { VoucherEntity } from './voucher.entity';
import { CustomerEntity } from './customer.entity';

export enum VoucherCustomerStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
    USED = 'USED',
}

@Entity('voucher_customer')
@Unique(['voucher_id', 'customer_id'])
@Index(['voucher_id', 'customer_id'])
export class VoucherCustomerEntity extends BaseEntity {
    @Column({ type: 'integer', nullable: false })
    voucher_id: number;

    @Column({ type: 'integer', nullable: false })
    customer_id: number;

    @Column({
        type: 'enum',
        enum: VoucherCustomerStatus,
        default: VoucherCustomerStatus.CREATED,
    })
    status: VoucherCustomerStatus;

    @ManyToOne(() => VoucherEntity, { eager: true })
    @JoinColumn({ name: 'voucher_id' })
    voucher: VoucherEntity;

    @ManyToOne(() => CustomerEntity, { eager: true })
    @JoinColumn({ name: 'customer_id' })
    customer: CustomerEntity;
}