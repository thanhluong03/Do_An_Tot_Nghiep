import { Module } from '@nestjs/common';
import { LoginController } from './login/login.controller';
import { AdminLoginController } from './login/admin-login.controller';
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
import { VoucherController } from './voucher/voucher.controller';
import { VoucherModule } from '@app/voucher';
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
import { CategoryController } from './category/category.controller';
import { CategoryModule } from '@app/category';
import { PaymentTransactionController } from './paymenttransaction/paymenttransaction.controller';
import { PaymenttransactionModule } from '../libs/paymenttransaction/src/paymenttransaction.module';
import { DatabaseModule } from '../libs/database/src/database.module';
import { ImportProductController } from './import_product/import_product.controller';
import { ImportProductModule } from '@app/import_product';
import { ConversationModule } from './conversation/conversation.module';
import { DeliveryProofController } from './delivery_proof/delivery_proof.controller';
import { DeliveryProofModule } from '@app/delivery_proof';
import { DriverLocationController } from './driver_location/driver_location.controller';
import { DriverLocationModule } from '@app/driver_location';
import { MailController } from './mail/mail.controller';
import { SendMailModule } from '@app/send_mail';
import { TrackingModule } from './tracking/tracking.module';
import { AuthModule } from '@app/auth';
import { AuthController } from './auth/auth.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ProductModule,
    SupplierModule,
    RoleModule,
    PermissionModule,
    StoreModule,
    UserModule,
    ReviewModule,
    PromotionModule,
    VoucherModule,
    CustomerModule,
    OrderModule,
    LoginModule,
    InventoryModule,
    NewsModule,
    CartItemModule,
    CategoryModule,
    PaymenttransactionModule,
    ImportProductModule,
    ConversationModule,
    DeliveryProofModule,
    SendMailModule,
    DriverLocationModule,
    TrackingModule,
    AuthModule,
  ],
  controllers: [
    AppController,
    ProductController,
    SupplierController,
    RoleController,
    PermissionController,
    StoreController,
    UserController,
    ReviewController,
    PromotionController,
    VoucherController,
    CustomerController,
    OrderController,
    LoginController,
    InventoryController,
    NewsController,
    CartItemController,
    CategoryController,
    PaymentTransactionController,
    ImportProductController,
    DeliveryProofController,
    DriverLocationController,
    AdminLoginController,
    MailController,
    AuthController,
  ],
  providers: [AppService],
})
export class AppModule { }
