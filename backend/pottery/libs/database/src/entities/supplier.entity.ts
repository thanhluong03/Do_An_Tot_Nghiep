import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('suppliers')
export class SupplierEntity extends BaseEntity {

    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string

    @Column({ type: 'text', nullable: true })
    address: string

    @Column({ type: 'varchar', nullable: true })
    phone: string

    @Column({ type: 'varchar', nullable: true })
    email: string
}