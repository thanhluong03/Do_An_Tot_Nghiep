import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule { }
