import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymenttransactionService } from './paymenttransaction.service';
import { PaymentTransactionRepository } from '@app/database';
import { PaymentTransactionEntity } from '@app/database';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTransactionEntity])],
  providers: [PaymenttransactionService, PaymentTransactionRepository],
  exports: [PaymenttransactionService, PaymentTransactionRepository],
})
export class PaymenttransactionModule { }
