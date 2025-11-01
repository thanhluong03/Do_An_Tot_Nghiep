import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { ReviewEntity } from '../entities/review.entity'
import { SupplierEntity } from '../entities'

@Injectable()
export class ReviewRepository {
    async findByOrderItemId(orderitem_id: number): Promise<ReviewEntity | null> {
        return this.repository.findOne({ where: { orderitem_id, deleted_at: IsNull() } });
    }
    constructor(
        @InjectRepository(ReviewEntity)
        private readonly repository: Repository<ReviewEntity>,
    ) { }

    async create(data: Partial<ReviewEntity>): Promise<ReviewEntity> {
        return this.repository.save(this.repository.create(data))
    }

    async findById(id: number): Promise<ReviewEntity | null> {
        return this.repository.findOne({
            where: { id, deleted_at: IsNull() },
        })
    }

    async findAll(p0: { size: number; page: number; key?: string }): Promise<any[]> {
        const raw = await this.repository.createQueryBuilder('review')
            .innerJoin('review.order_item', 'order_items')
            .innerJoin('customers', 'customer', 'customer.id = review.customer_id')
            .innerJoin('products', 'product', 'product.id = order_items.product_id')
            .where('review.deleted_at IS NULL')
            .select([
                'customer.id AS customer_id',
                'customer.full_name AS customer_name',
                'order_items.id AS order_items_id',
                'order_items.product_id AS product_id',
                'order_items.order_id AS order_id',
                'product.name AS product_name',
                'review.id AS review_id',
                'review.rating AS review_rating',
                'review.comment AS review_comment',
                'review.created_at AS review_created_at'
            ])
            .orderBy('review.created_at', 'DESC')
            .getRawMany();

        const grouped: any = {};
        raw.forEach(item => {
            const key = `${item.customer_id}_${item.product_id}`;
            if (!grouped[key]) {
                grouped[key] = {
                    customer: {
                        id: item.customer_id,
                        name: item.customer_name
                    },
                    product: {
                        id: item.product_id,
                        name: item.product_name
                    },
                    review: []
                };
            }
            grouped[key].review.push({
                order_items_id: item.order_items_id,
                order_id: item.order_id,
                id: item.review_id,
                rating: item.review_rating,
                comment: item.review_comment,
                created_at: item.review_created_at
            });
        });
        return Object.values(grouped);
    }

    async findByProductId(productId: number): Promise<any[]> {
        const raw = await this.repository.createQueryBuilder('review')
            .innerJoin('review.order_item', 'order_items')
            .innerJoin('customers', 'customer', 'customer.id = review.customer_id')
            .innerJoin('products', 'product', 'product.id = order_items.product_id')
            .where('order_items.product_id = :productId', { productId })
            .select([
                'customer.id AS customer_id',
                'customer.full_name AS customer_name',
                'order_items.id AS order_items_id',
                'order_items.product_id AS product_id',
                'order_items.order_id AS order_id',
                'product.name AS product_name',
                'review.id AS review_id',
                'review.rating AS review_rating',
                'review.comment AS review_comment',
                'review.created_at AS review_created_at'
            ])
            .orderBy('review.created_at', 'ASC')
            .getRawMany();

        return raw.map(item => ({
            customer: {
                id: item.customer_id,
                name: item.customer_name
            },
            product: {
                id: item.product_id,
                name: item.product_name
            },
            order_items_id: item.order_items_id,
            order_id: item.order_id,
            review: {
                id: item.review_id,
                rating: item.review_rating,
                comment: item.review_comment,
                created_at: item.review_created_at
            }
        }));
    }

    async update(id: number, data: Partial<ReviewEntity>): Promise<void> {
        await this.repository.update(id, data)
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id)
    }
}