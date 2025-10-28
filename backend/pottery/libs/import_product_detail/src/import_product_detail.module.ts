import { Module } from '@nestjs/common';
import { ImportProductDetailService } from './import_product_detail.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [ImportProductDetailService],
  exports: [ImportProductDetailService],
})
export class ImportProductDetailModule {}
