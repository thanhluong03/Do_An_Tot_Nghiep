import { Module } from '@nestjs/common';
import { LoginController } from './login/login.controller';
import { LoginModule } from '@app/login';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './product/product.controller';
import { ProductModule } from '@app/product';
import { ConfigModule } from '@nestjs/config';
import { SupplierController } from './supplier/supplier.controller';
import { SupplierModule } from '@app/supplier';
import { RoleController } from './role/role.controller';
import { RoleModule } from '@app/role';
import { PermissionController } from './permission/permission.controller';
import { PermissionModule } from '@app/permission';
import { StoreController } from './store/store.controller';
import { StoreModule } from '@app/store';
import { UserController } from './user/user.controller';
import { UserModule } from '@app/user';
import { ReviewController } from './review/review.controller';
import { ReviewModule } from '@app/review';
import { PromotionController } from './promotion/promotion.controller';
import { PromotionModule } from '@app/promotion';
import { FlashSaleController } from './flashsale/flashsale.controller';
import { FlashSaleModule } from '@app/flashsale';
import { CustomerController } from './customer/customer.controller';
import { CustomerModule } from '@app/customer';
import { OrderController } from './order/order.controller';
import { OrderModule } from '@app/order';
import { InventoryController } from './inventory/inventory.controller';
import { InventoryModule } from '@app/inventory';
import { NewsController } from './news/news.controller';
import { NewsModule } from '@app/news';
import { CartItemController } from './cart_item/cart_item.controller';
import { CartItemModule } from '@app/cart_item';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProductModule,
    SupplierModule,
    RoleModule,
    PermissionModule,
    StoreModule,
    UserModule,
    ReviewModule,
    PromotionModule,
    FlashSaleModule,
    CustomerModule,
    OrderModule,
    LoginModule,
    InventoryModule,
    NewsModule,
    CartItemModule
  ],
  controllers: [
    AppController, ProductController, SupplierController, RoleController, PermissionController, StoreController,
    UserController, ReviewController, PromotionController, FlashSaleController, CustomerController, OrderController, LoginController, InventoryController, NewsController, CartItemController
  ],
  providers: [AppService],
})
export class AppModule { }
