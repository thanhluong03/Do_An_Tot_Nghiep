import { Entity, Column, JoinColumn, ManyToOne, Unique, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { FlashSaleEntity } from './flash_sale.entity';
import { CustomerEntity } from './customer.entity';

export enum FlashSaleCustomerStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
    USED = 'USED',
}

@Entity('flash_sale_customer')
@Unique(['flash_sale_id', 'customer_id'])
@Index(['flash_sale_id', 'customer_id'])
export class FlashSaleCustomerEntity extends BaseEntity {
    @Column({ type: 'integer', nullable: false })
    flash_sale_id: number;

    @Column({ type: 'integer', nullable: false })
    customer_id: number;

    @Column({
        type: 'enum',
        enum: FlashSaleCustomerStatus,
        default: FlashSaleCustomerStatus.CREATED,
    })
    status: FlashSaleCustomerStatus;

    @ManyToOne(() => FlashSaleEntity, { eager: true })
    @JoinColumn({ name: 'flash_sale_id' })
    flash_sale: FlashSaleEntity;

    @ManyToOne(() => CustomerEntity, { eager: true })
    @JoinColumn({ name: 'customer_id' })
    customer: CustomerEntity;
}