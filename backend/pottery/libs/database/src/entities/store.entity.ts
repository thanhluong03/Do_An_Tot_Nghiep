import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('stores')
export class StoreEntity extends BaseEntity {

    @Column({ type: 'varchar', nullable: false })
    store_name: string

    @Column({ type: 'text', nullable: true })
    address: string

    @Column({ type: 'varchar', length: 12, nullable: true })
    phone: string
}