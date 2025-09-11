import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('roles')
export class RoleEntity extends BaseEntity {

    @Column({ type: 'varchar', length: 50, nullable: false })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string
}