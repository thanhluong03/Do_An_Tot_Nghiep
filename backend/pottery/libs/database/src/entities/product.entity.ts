import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'

// import { RoleEntity } from './role.entity'

@Entity('products')
export class ProductEntity extends BaseEntity {

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number

  @Column({ type: 'integer', nullable: false })
  quantity: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_url: string

  @Column({ type: 'integer', nullable: true })
  supplier_id: number

}