import { Module } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [PromotionService],
  exports: [PromotionService],
})
export class PromotionModule { }
