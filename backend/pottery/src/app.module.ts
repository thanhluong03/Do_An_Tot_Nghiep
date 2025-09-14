import { Module } from '@nestjs/common';
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
  ],
  controllers: [AppController, ProductController, SupplierController, RoleController, PermissionController, StoreController, 
    UserController
  ],
  providers: [AppService],
})
export class AppModule { }
