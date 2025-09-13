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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProductModule,
    SupplierModule,
    RoleModule,
    PermissionModule,
  ],
  controllers: [AppController, ProductController, SupplierController, RoleController, PermissionController],
  providers: [AppService],
})
export class AppModule { }
