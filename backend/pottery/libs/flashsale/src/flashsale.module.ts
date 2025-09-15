import { Module } from '@nestjs/common';
import { FlashSaleService } from './flashsale.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [FlashSaleService],
  exports: [FlashSaleService],
})
export class FlashSaleModule { }
