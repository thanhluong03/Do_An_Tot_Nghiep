import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { ProductEntity } from '../entities/product.entity'

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async create(data: Partial<ProductEntity>): Promise<ProductEntity> {
    return this.repository.save(this.repository.create(data))
  }

  async findById(id: number): Promise<ProductEntity | null> {
    return this.repository.findOne({
      where: { id, deleted_at: IsNull() },
    })
  }

  async findAll(p0: { size: number; page: number; key?: string }): Promise<ProductEntity[]> {
    return this.repository.find({
      where: { deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    })
  }

  async update(id: number, data: Partial<ProductEntity>): Promise<void> {
    await this.repository.update(id, data)
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id)
  }
}