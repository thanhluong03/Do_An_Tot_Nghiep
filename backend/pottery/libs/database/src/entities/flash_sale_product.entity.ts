import { Entity, Column, JoinColumn, ManyToOne, Unique, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { FlashSaleEntity } from './flash_sale.entity';
import { UserEntity } from './user.entity';

export enum FlashSaleProductStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
    USED = 'USED',
}

@Entity('flash_sale_products')
@Unique(['flash_sale_id', 'user_id'])
@Index(['flash_sale_id', 'user_id'])
export class FlashSaleProductEntity extends BaseEntity {
    @Column({ type: 'integer', nullable: false })
    flash_sale_id: number;

    @Column({ type: 'integer', nullable: false })
    user_id: number;

    @Column({
        type: 'enum',
        enum: FlashSaleProductStatus,
        default: FlashSaleProductStatus.CREATED,
    })
    status: FlashSaleProductStatus;

    @ManyToOne(() => FlashSaleEntity, { eager: true })
    @JoinColumn({ name: 'flash_sale_id' })
    flash_sale: FlashSaleEntity;

    @ManyToOne(() => UserEntity, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}