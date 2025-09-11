import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('permissions')
export class PermissionEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    role_id: number

    @Column({ type: 'varchar', length: 100, nullable: false })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string
}