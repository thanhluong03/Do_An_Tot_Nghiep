import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
