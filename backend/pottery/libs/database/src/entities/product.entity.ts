import { Entity, Column, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { ProductImageEntity } from './product_image.entity';

// import { RoleEntity } from './role.entity'

@Entity('products')
export class ProductEntity extends BaseEntity {
  @Column({ type: 'integer', nullable: false })
  supplier_id: number

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string

  @Column({ type: 'varchar', nullable: true })
  description: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number

  @Column({ type: 'integer', nullable: true })
  quantity: number

  @OneToMany(() => ProductImageEntity, (productImage) => productImage.product, {
    cascade: true,
    eager: false,
  })
  images: ProductImageEntity[];
}