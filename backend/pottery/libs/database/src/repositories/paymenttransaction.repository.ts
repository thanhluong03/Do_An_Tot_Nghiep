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
        try {
            const entity = this.paymentTransactionRepo.create(data);
            const savedEntity = await this.paymentTransactionRepo.save(entity);
            return savedEntity;
        } catch (error) {
            console.error('[PaymentTransactionRepository] Error creating transaction:', error);
            throw error;
        }
    }

    async findByGatewayTxnRef(gateway_txn_ref: string): Promise<PaymentTransactionEntity | null> {
        try {
            return await this.paymentTransactionRepo.findOne({
                where: { gateway_txn_ref }
            });
        } catch (error) {
            console.error('[PaymentTransactionRepository] Error finding by gateway_txn_ref:', error);
            return null;
        }
    }

    async findAll({ limit = 20, offset = 0 }: { limit?: number; offset?: number }) {
        try {
            return await this.paymentTransactionRepo.find({
                skip: offset,
                take: limit,
                order: { created_at: 'DESC' },
            });
        } catch (error) {
            console.error('[PaymentTransactionRepository] Error finding all transactions:', error);
            return [];
        }
    }

    async findByOrderId(order_id: number) {
        try {
            return await this.paymentTransactionRepo.find({
                where: { order_id },
                order: { created_at: 'DESC' },
            });
        } catch (error) {
            console.error('[PaymentTransactionRepository] Error finding by order_id:', error);
            return [];
        }
    }
}