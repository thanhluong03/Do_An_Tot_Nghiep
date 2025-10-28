import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ProductAttributeEntity } from '../entities/product_attributes.entity';

@Injectable()
export class ProductAttributeRepository {
  constructor(
    @InjectRepository(ProductAttributeEntity)
    private readonly repository: Repository<ProductAttributeEntity>,
  ) {}

  async create(
    data: Partial<ProductAttributeEntity>,
  ): Promise<ProductAttributeEntity> {
    return this.repository.save(this.repository.create(data));
  }

  async findByClassificationId(
    classificationId: number,
  ): Promise<ProductAttributeEntity[]> {
    return await this.repository.find({
      where: {
        product_classification_id: classificationId,
        deleted_at: IsNull(),
      },
    });
  }

  async findById(id: number): Promise<ProductAttributeEntity | null> {
    return await this.repository.findOne({
      where: { id, deleted_at: IsNull() },
    });
  }

  async createMany(
    data: Partial<ProductAttributeEntity>[],
  ): Promise<ProductAttributeEntity[]> {
    const attributes = this.repository.create(data);
    return await this.repository.save(attributes);
  }

  async deleteByClassificationId(classificationId: number): Promise<void> {
    await this.repository.update(
      { product_classification_id: classificationId },
      { deleted_at: new Date() },
    );
  }

  async update(
    id: number,
    data: Partial<ProductAttributeEntity>,
  ): Promise<void> {
    await this.repository.update({ id }, data);
  }
}
