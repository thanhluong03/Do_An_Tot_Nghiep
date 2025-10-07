import { Entity, Column, OneToMany } from 'typeorm'
import { ProductPromotionEntity } from './product_promotion.entity';
import { BaseEntity } from './base.entity'
import { ProductImageEntity } from './product_image.entity';
import { InventoryEntity } from './inventory.entity';
import { ImportProductEntity } from './import_product.entity';

// import { RoleEntity } from './role.entity'

@Entity('products')
export class ProductEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string

  @Column({ type: 'varchar', nullable: true })
  description: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number

  @Column({ type: 'integer', nullable: false })
  quantity: number

  @Column({ type: 'integer', nullable: false })
  category_id: number

  @OneToMany(() => ProductImageEntity, (productImage) => productImage.product, {
    cascade: true,
    eager: false,
  })
  images: ProductImageEntity[];
  @OneToMany(() => ProductPromotionEntity, (productPromotion) => productPromotion.product)
  productPromotions: ProductPromotionEntity[];

  @OneToMany(() => InventoryEntity, (inventory) => inventory.product)
  inventories: InventoryEntity[];

  @OneToMany(() => ImportProductEntity, (importProduct) => importProduct.product)
  importProducts: ImportProductEntity[];
}