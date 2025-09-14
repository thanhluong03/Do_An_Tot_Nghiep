import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule { }
