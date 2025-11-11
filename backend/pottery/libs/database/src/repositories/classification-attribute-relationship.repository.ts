import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ClassificationAttributeRelationshipEntity } from '../entities/classification_attribute_relationship.entity';

@Injectable()
export class ClassificationAttributeRelationshipRepository {
  constructor(
    @InjectRepository(ClassificationAttributeRelationshipEntity)
    private readonly repository: Repository<ClassificationAttributeRelationshipEntity>,
  ) {}

  async create(
    data: Partial<ClassificationAttributeRelationshipEntity>,
  ): Promise<ClassificationAttributeRelationshipEntity> {
    return this.repository.save(this.repository.create(data));
  }

  async createMany(
    data: Partial<ClassificationAttributeRelationshipEntity>[],
  ): Promise<ClassificationAttributeRelationshipEntity[]> {
    const relationships = this.repository.create(data);
    return await this.repository.save(relationships);
  }

  async findByProductId(
    productId: number,
  ): Promise<ClassificationAttributeRelationshipEntity[]> {
    return await this.repository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.attribute1', 'attr1')
      .leftJoinAndSelect('car.attribute2', 'attr2')
      .leftJoinAndSelect('attr1.classification', 'class1')
      .leftJoinAndSelect('attr2.classification', 'class2')
      .where(
        'class1.product_id = :productId OR class2.product_id = :productId',
        { productId },
      )
      .andWhere('car.deleted_at IS NULL')
      .getMany();
  }

  async deleteByProductId(productId: number): Promise<void> {
    const relationships = await this.findByProductId(productId);
    const ids = relationships.map((r) => r.id);
    if (ids.length > 0) {
      await this.repository.update(ids, { deleted_at: new Date() });
    }
  }

  async update(
    id: number,
    data: Partial<ClassificationAttributeRelationshipEntity>,
  ): Promise<void> {
    await this.repository.update({ id }, data);
  }

  async findById(
    id: number,
  ): Promise<ClassificationAttributeRelationshipEntity | null> {
    return await this.repository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['attribute1', 'attribute2'],
    });
  }

  async findByProductIdForImport(
    productId: number,
  ): Promise<ClassificationAttributeRelationshipEntity[]> {
    return await this.repository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.attribute1', 'attr1')
      .leftJoinAndSelect('car.attribute2', 'attr2')
      .leftJoinAndSelect('attr1.classification', 'class1')
      .leftJoinAndSelect('attr2.classification', 'class2')
      .where('class1.product_id = :productId', { productId })
      .andWhere('car.deleted_at IS NULL')
      .orderBy('car.id', 'ASC')
      .getMany();
  }

  async save(entity: ClassificationAttributeRelationshipEntity): Promise<ClassificationAttributeRelationshipEntity> {
    return this.repository.save(entity);
  }
}
