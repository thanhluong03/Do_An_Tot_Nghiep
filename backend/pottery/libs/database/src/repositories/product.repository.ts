import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { ProductEntity } from '../entities/product.entity'

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) { }

  async create(data: Partial<ProductEntity>): Promise<ProductEntity> {
    return this.repository.save(this.repository.create(data))
  }

  async findById(id: number): Promise<ProductEntity | null> {
    return this.repository.findOne({
      where: { id, deleted_at: IsNull() },
    })
  }

  async findAll(params: { size: number; page: number; key?: string; start_date?: string; end_date?: string }): Promise<ProductEntity[]> {
    const query = this.repository.createQueryBuilder('product');
    query.where('product.deleted_at IS NULL');

    if (params.start_date) {
      query.andWhere('product.created_at >= :start_date', { start_date: params.start_date });
    }

    if (params.end_date) {
      const endDatePlusOne = new Date(params.end_date);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
      query.andWhere('product.created_at < :end_date', {
        end_date: endDatePlusOne.toISOString().split('T')[0]
      });
    }

    if (params.key) {
      query.andWhere(
        '(product.name LIKE :key OR product.description LIKE :key)',
        { key: `%${params.key}%` }
      );
    }

    query.orderBy('product.created_at', 'DESC');
    return query.getMany();
  }

  async update(id: number, data: Partial<ProductEntity>): Promise<void> {
    await this.repository.update(id, data)
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id)
  }

  async findBySupplier(supplier_id: number): Promise<ProductEntity[]> {
    return this.repository.find({
      where: { supplier_id: supplier_id, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }
}