import { Module } from '@nestjs/common';
import { CartItemService } from './cart_item.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [CartItemService],
  exports: [CartItemService],
})
export class CartItemModule { }
