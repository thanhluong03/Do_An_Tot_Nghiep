import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTransactionEntity } from '../entities/paymenttransaction.entity';

@Injectable()
export class PaymentTransactionRepository {
    constructor(
        @InjectRepository(PaymentTransactionEntity)
        private readonly paymentTransactionRepo: Repository<PaymentTransactionEntity>,
    ) { }

    async create(data: Partial<PaymentTransactionEntity>): Promise<PaymentTransactionEntity> {
        const entity = this.paymentTransactionRepo.create(data);
        return this.paymentTransactionRepo.save(entity);
    }

    async findByGatewayTxnRef(gateway_txn_ref: string): Promise<PaymentTransactionEntity | null> {
        return this.paymentTransactionRepo.findOne({ where: { gateway_txn_ref } });
    }
    async findAll({ limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
        return this.paymentTransactionRepo.find({
            skip: offset,
            take: limit,
            order: { created_at: 'DESC' },
        });
    }

    async findByOrderId(order_id: number) {
        return this.paymentTransactionRepo.find({
            where: { order_id },
            order: { created_at: 'DESC' },
        });
    }
}