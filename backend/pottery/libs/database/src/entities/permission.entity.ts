import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { RoleEntity } from './role.entity'

@Entity('permissions')
export class PermissionEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    role_id: number

    @ManyToOne(() => RoleEntity, role => role.permissions)
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity

    @Column({ type: 'varchar', length: 100, nullable: false })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string
}