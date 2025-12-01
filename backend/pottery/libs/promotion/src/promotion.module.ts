
import { Module } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { DatabaseModule } from '@app/database';
import { ProductImageRepository } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [PromotionService, ProductImageRepository],
  exports: [PromotionService],
})
export class PromotionModule { }
