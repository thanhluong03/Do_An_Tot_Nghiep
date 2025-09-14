import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('users')
export class UserEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    role_id: number

    @Column({ type: 'varchar', length: 100, nullable: false })
    username: string

    @Column({ type: 'varchar', length: 100, nullable: false })
    password_hash: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string

    @Column({ type: 'varchar', length: 100, nullable: true })
    full_name: string

    @Column({ type: 'varchar', length: 12, nullable: true })
    phone_number: string

    @Column({ type: 'text', nullable: false })
    address: string

    @Column({ type: 'bytea', nullable: true })
    avatar_image: Buffer

    @Column({ type: 'boolean', nullable: true })
    is_active: boolean

}