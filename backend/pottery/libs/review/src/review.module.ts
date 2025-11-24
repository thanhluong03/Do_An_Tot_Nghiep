import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { DatabaseModule } from '@app/database';
import { ReviewImageRepository } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [ReviewService, ReviewImageRepository],
  exports: [ReviewService],
})
export class ReviewModule { }
