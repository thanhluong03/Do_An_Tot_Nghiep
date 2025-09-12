import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductController } from './product/product.controller';
import { ProductModule } from '@app/product';
import { ConfigModule } from '@nestjs/config';
import { SupplierController } from './supplier/supplier.controller';
import { SupplierModule } from '@app/supplier';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProductModule,
    SupplierModule,
  ],
  controllers: [AppController, ProductController, SupplierController],
  providers: [AppService],
})
export class AppModule { }
