import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportProductService } from './import_product.service';
import { ImportProductEntity } from '@app/database';
import { DatabaseModule } from '@app/database';
import { ImportProductRepository } from '@app/database/repositories/import_product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ImportProductEntity]), DatabaseModule],
  providers: [ImportProductService, ImportProductRepository],
  exports: [ImportProductService, ImportProductRepository],
})
export class ImportProductModule {}
