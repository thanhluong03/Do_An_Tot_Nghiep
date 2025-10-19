import { Entity, Column, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { PermissionEntity } from './permission.entity'
import { UserEntity } from './user.entity'

@Entity('roles')
export class RoleEntity extends BaseEntity {

    @Column({ type: 'varchar', length: 50, nullable: false })
    name: string

    @Column({ type: 'text', nullable: true })
    description: string

    @OneToMany(() => PermissionEntity, permission => permission.role)
    permissions: PermissionEntity[]

    @OneToMany(() => UserEntity, (user) => user.role)
    users: UserEntity[];
}