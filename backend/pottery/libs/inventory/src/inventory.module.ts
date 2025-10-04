import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryEntity } from '@app/database';
import { DatabaseModule } from '@app/database';
import { InventoryRepository } from '@app/database/repositories/inventory.repository';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryEntity]), DatabaseModule],
  providers: [InventoryService, InventoryRepository],
  exports: [InventoryService, InventoryRepository],
})
export class InventoryModule { }
