import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductEntity } from './product.entity';
import { PromotionEntity } from './promotion.entity';

@Entity('product_promotions')
export class ProductPromotionEntity extends BaseEntity {

    @Column({ type: 'integer', nullable: false })
    product_id: number

    // @Column({ type: 'integer', nullable: false })
    // promotion_id: number
    // 💡 Đảm bảo rằng TRƯỜNG NÀY LÀ NULLABLE
    @Column({ type: 'integer', nullable: true }) 
    promotion_id: number | null // Hoặc chỉ number, tùy cách bạn định nghĩa type

    @ManyToOne(() => ProductEntity, (product) => product.productPromotions)
    @JoinColumn({ name: 'product_id' })
    product: ProductEntity;

    @ManyToOne(() => PromotionEntity, (promotion) => promotion.productPromotions)
    @JoinColumn({ name: 'promotion_id' })
    promotion: PromotionEntity;
}