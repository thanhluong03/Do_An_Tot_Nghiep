import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { InventoryEntity } from './inventory.entity';

@Entity('stores')
export class StoreEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    store_name: string

    @Column({ type: 'text', nullable: true })
    address: string

    @Column({ type: 'varchar', length: 12, nullable: true })
    phone: string

    @OneToMany(() => InventoryEntity, (inventory) => inventory.store)
    inventories: InventoryEntity[];
}