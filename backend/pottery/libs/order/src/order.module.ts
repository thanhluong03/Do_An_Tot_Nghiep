import { Module, forwardRef } from '@nestjs/common';
import { OrderService } from './order.service';
import { DatabaseModule } from '@app/database';
import {
  OrderRepository,
  InventoryRepository,
  CategoryRepository,
  OrderStatusHistoryRepository,
  UserRepository,
  CustomerRepository,
  ProductImageRepository,
  ProductRepository,
  InventoryDetailRepository,
  ClassificationAttributeRelationshipRepository,
} from '@app/database';

@Module({
  imports: [DatabaseModule],
  providers: [
    OrderService,
    OrderRepository,
    InventoryRepository,
    CategoryRepository,
    OrderStatusHistoryRepository,
    UserRepository,
    CustomerRepository,
    ProductImageRepository,
    ProductRepository,
    InventoryDetailRepository,
    ClassificationAttributeRelationshipRepository,
  ],
  exports: [OrderService],
})
export class OrderModule { }
