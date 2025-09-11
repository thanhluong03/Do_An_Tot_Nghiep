import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('news')
export class NewsEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    user_id: number

    @Column({ type: 'varchar', nullable: false })
    title: string

    @Column({ type: 'text', nullable: true })
    content: string

    @Column({ type: 'timestamptz', nullable: true })
    published_at: Date

    @Column({ type: 'boolean', default: true })
    is_published: boolean
}