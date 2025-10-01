import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule { }
