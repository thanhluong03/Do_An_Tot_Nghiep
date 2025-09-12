import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { SupplierEntity } from '../entities/supplier.entity'

@Injectable()
export class SupplierRepository {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly repository: Repository<SupplierEntity>,
  ) {}

  async create(data: Partial<SupplierEntity>): Promise<SupplierEntity> {
    return this.repository.save(this.repository.create(data))
  }

  async findById(id: number): Promise<SupplierEntity | null> {
    return this.repository.findOne({
      where: { id, deleted_at: IsNull() },
    })
  }

  async findAll(p0: { size: number; page: number; key?: string }): Promise<SupplierEntity[]> {
    return this.repository.find({
      where: { deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    })
  }

  async update(id: number, data: Partial<SupplierEntity>): Promise<void> {
    await this.repository.update(id, data)
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id)
  }
}