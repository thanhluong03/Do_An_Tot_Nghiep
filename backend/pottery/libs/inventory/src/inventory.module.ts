import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import {
  InventoryEntity,
  InventoryDetailEntity,
  ClassificationAttributeRelationshipEntity,
} from '@app/database';
import { DatabaseModule } from '@app/database';
import {
  InventoryRepository,
  InventoryDetailRepository,
  ClassificationAttributeRelationshipRepository,
} from '@app/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryEntity,
      InventoryDetailEntity,
      ClassificationAttributeRelationshipEntity,
    ]),
    DatabaseModule,
  ],
  providers: [
    InventoryService,
    InventoryRepository,
    InventoryDetailRepository,
    ClassificationAttributeRelationshipRepository,
  ],
  exports: [
    InventoryService,
    InventoryRepository,
    InventoryDetailRepository,
    ClassificationAttributeRelationshipRepository,
  ],
})
export class InventoryModule { }
