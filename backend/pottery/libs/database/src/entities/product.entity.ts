import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { ProductPromotionEntity } from './product_promotion.entity';
import { BaseEntity } from './base.entity'
import { ProductImageEntity } from './product_image.entity';
import { InventoryEntity } from './inventory.entity';
import { ImportProductDetailEntity } from './import_product_detail.entity';
import { CategoryEntity } from './category.entity';
import { SupplierEntity } from './supplier.entity';
import { OrderItemEntity } from './order_item.entity';
import { CartItemEntity } from './cart_item.entity';
import { ProductClassificationEntity } from './product_classification.entity';
import { ImportRequestDetailEntity } from './import_request_detail.entity';
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
  total_quantity_divided: number

  @Column({ type: 'integer', nullable: false })
  category_id: number

  @Column({ type: 'integer', nullable: false })
  supplier_id: number

  @OneToMany(() => ProductImageEntity, (productImage) => productImage.product, {
    cascade: true,
    eager: false,
  })
  images: ProductImageEntity[];
  @OneToMany(() => ProductPromotionEntity, (productPromotion) => productPromotion.product)
  productPromotions: ProductPromotionEntity[];

  @OneToMany(() => InventoryEntity, (inventory) => inventory.product)
  inventories: InventoryEntity[];

  @OneToMany(() => ImportProductDetailEntity, (importProductDetail) => importProductDetail.product)
  importProductDetails: ImportProductDetailEntity[];

  @ManyToOne(() => CategoryEntity, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => SupplierEntity, (supplier) => supplier.products)
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.product)
  orderItems: OrderItemEntity[];

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.product)
  cartItems: CartItemEntity[];

  @OneToMany(() => ProductClassificationEntity, (productClassification) => productClassification.product)
  classifications: ProductClassificationEntity[];

  @OneToMany(() => ImportRequestDetailEntity, (importRequestDetail) => importRequestDetail.product)
  importRequestDetails: ImportRequestDetailEntity[];
}
