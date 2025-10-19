import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from './base.entity'
import { ProductEntity } from './product.entity';

@Entity('categories')
export class CategoryEntity extends BaseEntity {

    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    description: string

    @OneToMany(() => ProductEntity, (product) => product.category)
    products: ProductEntity[];
}